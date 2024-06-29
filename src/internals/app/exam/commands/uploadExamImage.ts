import {ExamRepository} from "../../../domain/exams/repository";
import {StorageRepository} from "../../../domain/storage/repository";
import {EditExamParams} from "../../../domain/exams/exam";
import {Environment} from "../../../../pkg/configs/env";

export interface UploadExamImageCommand {
    Handle: (id: string, file: Express.Multer.File) => Promise<void>
}

export class UploadExamImageCommandC implements UploadExamImageCommand {
    examRepository: ExamRepository
    storageRepository: StorageRepository
    environmentVariable: Environment

    constructor(examRepository: ExamRepository, storageRepository: StorageRepository) {
        this.examRepository = examRepository
        this.storageRepository = storageRepository
        this.environmentVariable = new Environment()
    }

    async Handle(id: string, file: Express.Multer.File): Promise<void> {
        try {
            const examExist = await this.examRepository.GetExamById(id)

            const {fileURL: imageUrl, blobName  } = await this.storageRepository.upload(file,this.environmentVariable.azExamImageContainerName,examExist.id as string,)
            const updatedExam : EditExamParams = {
                imageURL: imageUrl,
            }

            await this.examRepository.EditExam(examExist.id as string,updatedExam)
        } catch (error) {
            throw error
        }
    }

}
