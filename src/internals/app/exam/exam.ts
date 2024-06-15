import {AddExamCommand, AddExamCommandC} from "./commands/addExam";
import {ExamRepository} from "../../domain/exams/repository";
import {EditExamCommand, EditExamCommandC} from "./commands/editExam";
import {UploadExamImageCommand, UploadExamImageCommandC} from "./commands/uploadExamImage";
import {StorageRepository} from "../../domain/storage/repository";
import {DeleteExamCommand, DeleteExamCommandC} from "./commands/deleteExam";
import {GetExamsQuery, GetExamsQueryC} from "./query/getExams";
import {AddCourseCommand, AddCourseCommandC} from "./commands/addCourse";
import {DeleteCourseCommand, DeleteCourseCommandC} from "./commands/deleteCourse";
import {EditCourseCommand, EditCourseCommandC} from "./commands/editCourse";
import {GetCoursesQuery, GetCoursesQueryC} from "./query/getCourses";
import {AddSubjectCommand, AddSubjectCommandC} from "./commands/addSubject";
import {EditSubjectCommand, EditSubjectCommandC} from "./commands/editSubject";
import {DeleteSubjectCommand, DeleteSubjectCommandC} from "./commands/deleteSubject";
import {GetSubjectsQuery, GetSubjectsQueryC} from "./query/getSubjects";

export class Commands {
    addExam: AddExamCommand;
    deleteExam: DeleteExamCommand
    editExam: EditExamCommand
    uploadExamImage: UploadExamImageCommand

    addCourse: AddCourseCommand
    deleteCourse: DeleteCourseCommand
    editCourse: EditCourseCommand

    addSubject: AddSubjectCommand
    deleteSubject: DeleteSubjectCommand
    editSubject: EditSubjectCommand

    constructor(examRepository: ExamRepository, storageRepository: StorageRepository) {
        this.addExam = new AddExamCommandC(examRepository)
        this.deleteExam = new DeleteExamCommandC(examRepository)
        this.editExam = new EditExamCommandC(examRepository)
        this.uploadExamImage = new UploadExamImageCommandC(examRepository, storageRepository)

        this.addCourse = new  AddCourseCommandC(examRepository)
        this.deleteCourse = new DeleteCourseCommandC(examRepository)
        this.editCourse = new EditCourseCommandC(examRepository)

        this.addSubject = new  AddSubjectCommandC(examRepository)
        this.deleteSubject = new DeleteSubjectCommandC(examRepository)
        this.editSubject = new EditSubjectCommandC(examRepository)
    }
}

export class Queries {
    getExams: GetExamsQuery
    getCourses: GetCoursesQuery
    getSubjects: GetSubjectsQuery

    constructor(examRepository: ExamRepository) {
        this.getExams = new GetExamsQueryC(examRepository)
        this.getCourses = new GetCoursesQueryC(examRepository)
        this.getSubjects = new GetSubjectsQueryC(examRepository)
    }
}

export class ExamServices {
    examRepository: ExamRepository
    storageRepository: StorageRepository
    commands: Commands
    queries: Queries

    constructor(examRepository: ExamRepository, storageRepository: StorageRepository) {
        this.examRepository = examRepository;
        this.storageRepository = storageRepository;
        this.commands = new Commands(examRepository, storageRepository)
        this.queries = new Queries(examRepository)
    }
}