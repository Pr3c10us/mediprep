import {EditExamParams, ExamQuestionFile} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";
import {StorageRepository} from "../../../domain/storage/repository";
import {Environment} from "../../../../pkg/configs/env";
import {QueueRepository} from "../../../domain/queue/repository";
import {newEmailQueueRecord, newExamQuestionFileQueueRecord, Record} from "../../../domain/queue/producer";

export interface AddQuestionFileCommand {
    Handle: (id: string, file: Express.Multer.File) => Promise<void>
}

export class AddQuestionFileCommandC implements AddQuestionFileCommand {
    examRepository: ExamRepository
    storageRepository: StorageRepository
    queueRepository: QueueRepository
    environmentVariable: Environment


    constructor(examRepository: ExamRepository, storageRepository: StorageRepository,queueRepository: QueueRepository) {
        this.examRepository = examRepository
        this.storageRepository = storageRepository
        this.queueRepository = queueRepository
        this.environmentVariable = new Environment()
    }

    async Handle(id: string, file: Express.Multer.File): Promise<void> {
        try {
            const examExist = await this.examRepository.GetExamById(id)

            const {fileURL,blobName} = await this.storageRepository.upload(file, this.environmentVariable.azExamQuestionFileContainer, examExist.id as string,)

            const questionBatch = await this.examRepository.AddQuestionBatch(examExist.id as string)
            const data: ExamQuestionFile =  {
                blobName,
                examId: examExist.id as string,
                batchId: questionBatch.id
            }
            const examQuestionFileQueueRecord: Record = newExamQuestionFileQueueRecord(data);
            await this.queueRepository.Produce(examQuestionFileQueueRecord);
        } catch (error) {
            throw error
        }
    }

}