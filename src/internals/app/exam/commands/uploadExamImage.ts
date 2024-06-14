import {ExamRepository} from "../../../domain/exams/repository";
import {StorageRepository} from "../../../domain/storage/repository";
import {BadRequestError} from "../../../../pkg/errors/customError";
import {EditExamParams} from "../../../domain/exams/exam";

export interface UploadExamImageCommand {
    Handle: (id: string, file: Express.Multer.File) => Promise<void>
}

export class UploadExamImageCommandC implements UploadExamImageCommand {
    examRepository: ExamRepository
    storageRepository: StorageRepository

    constructor(examRepository: ExamRepository, storageRepository: StorageRepository) {
        this.examRepository = examRepository
        this.storageRepository = storageRepository
    }

    async Handle(id: string, file: Express.Multer.File): Promise<void> {
        try {
            const examExist = await this.examRepository.GetExamById(id)
            if (!examExist) {
                throw new BadRequestError("exam does not exist")
            }

            //     upload image
            const imageUrl = await this.storageRepository.uploadExamImage(examExist.id as string,file)

            const updatedExam : EditExamParams = {
                imageURL: imageUrl
            }

            await this.examRepository.EditExam(examExist.id as string,updatedExam)
        } catch (error) {
            throw error
        }
    }

}
