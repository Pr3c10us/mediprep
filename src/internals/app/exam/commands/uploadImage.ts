import {ExamRepository} from "../../../domain/exams/repository";
import {StorageRepository} from "../../../domain/storage/repository";
import {Environment} from "../../../../pkg/configs/env";
import {v4} from "uuid";

export interface UploadImageCommand {
    Handle: (file: Express.Multer.File) => Promise<string>
}

export class UploadImageCommandC implements UploadImageCommand {
    storageRepository: StorageRepository
    environmentVariable: Environment

    constructor( storageRepository: StorageRepository) {
        this.storageRepository = storageRepository
        this.environmentVariable = new Environment()
    }

    async Handle(file: Express.Multer.File): Promise<string> {
        try {
            const {
                fileURL,
                blobName
            } = await this.storageRepository.upload(file, this.environmentVariable.azExamImageContainerName, v4())
            return fileURL
        } catch (error) {
            throw error
        }
    }

}
