import {AddExamCommand, AddExamCommandC} from "./commands/addExam";
import {ExamRepository} from "../../domain/exams/repository";
import {EditExamCommand, EditExamCommandC} from "./commands/editExam";
import {UploadExamImageCommand, UploadExamImageCommandC} from "./commands/uploadExamImage";
import {StorageRepository} from "../../domain/storage/repository";

export class Commands {
    addExam: AddExamCommand;
    editExam: EditExamCommand
    uploadExamImage : UploadExamImageCommand

    constructor(examRepository : ExamRepository,storageRepository: StorageRepository) {
        this.addExam = new AddExamCommandC(examRepository)
        this.editExam = new EditExamCommandC(examRepository)
        this.uploadExamImage = new UploadExamImageCommandC(examRepository,storageRepository)
    }
}

export class Queries {
    constructor(examRepository : ExamRepository) {
    }
}

export class ExamServices {
    examRepository: ExamRepository
    storageRepository: StorageRepository
    commands: Commands
    queries: Queries

    constructor(examRepository : ExamRepository,storageRepository: StorageRepository) {
        this.examRepository = examRepository;
        this.storageRepository = storageRepository;
        this.commands = new Commands(examRepository,storageRepository)
        this.queries = new Queries(examRepository)
    }
}