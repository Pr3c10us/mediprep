import {Course, EditExamParams, EditQuestionParams, Exam, Question, Subject} from "./exam";
import {PaginationFilter, PaginationMetaData} from "../../../pkg/types/pagination";

export interface ExamRepository {
    AddExam: (exam: Exam) => Promise<void>
    EditExam: (id: string, examParams: EditExamParams) => Promise<void> // pass imageURL
    DeleteExam: (id: string) => Promise<void>
    // GetExamDetails: (id: string) => Promise<Exam>
    GetExamById: (id: string) => Promise<Exam>
    GetExams: (filter: PaginationFilter) => Promise<{ exams: Exam[], metadata: PaginationMetaData }>

    AddCourse: (examId: string, course: Course) => Promise<void>
    EditCourseName: (id: string, name: string) => Promise<void>
    DeleteCourse: (id: string) => Promise<void>
    GetCourses: (filter: PaginationFilter) => Promise<{ courses: Course[], metadata: PaginationMetaData }>

    AddSubject: (courseId: string, subject: Subject) => Promise<void>
    EditSubjectName: (id: string, name: string) => Promise<void>
    DeleteSubject: (id: string) => Promise<void>
    GetSubjects: (filter: PaginationFilter) => Promise<{ subjects: Subject[], metadata: PaginationMetaData }>

    AddQuestion: (subjectId: string, question: Question) => Promise<void>
    EditQuestion: (id: string, questionParams: EditQuestionParams) => Promise<void>
    DeleteQuestion: (id: string) => Promise<void>
    // GetQuestionDetails: (id: string) => Promise<Question>
    GetQuestions: (filter: PaginationFilter) => Promise<{ questions: Question[], metadata: PaginationMetaData }> // filer to include subjectId
}