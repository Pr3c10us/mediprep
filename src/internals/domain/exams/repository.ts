import {
    Course,
    EditExamParams,
    EditQuestionParams,
    Exam,
    ExamDiscount,
    Question,
    QuestionBatch,
    QuestionBatchStatus,
    QuestionWithReason,
    Subject
} from "./exam";
import {PaginationFilter, PaginationMetaData} from "../../../pkg/types/pagination";

export interface ExamRepository {
    AddExam: (exam: Exam) => Promise<void>
    EditExam: (id: string, examParams: EditExamParams) => Promise<void>
    DeleteExam: (id: string) => Promise<void>
    // GetExamDetails: (id: string) => Promise<Exam>
    GetExamById: (id: string) => Promise<Exam>
    GetExamAnalytics: (id: string) => Promise<Exam>
    GetExams: (filter: PaginationFilter) => Promise<{ exams: Exam[], metadata: PaginationMetaData }>
    AddExamDiscount: (discount: ExamDiscount) => Promise<void>
    DeleteDiscount: (id: string) => Promise<void>
    GetExamDiscounts: (examId: string) => Promise<ExamDiscount[]>

    AddCourse: (course: Course) => Promise<Course>
    EditCourseName: (id: string, name: string) => Promise<void>
    DeleteCourse: (id: string) => Promise<void>
    GetCourseById: (courseId: string) => Promise<Course>
    GetCourses: (filter: PaginationFilter) => Promise<{ courses: Course[], metadata: PaginationMetaData }>

    AddSubject: (subject: Subject) => Promise<Course>
    EditSubjectName: (id: string, name: string) => Promise<void>
    DeleteSubject: (id: string) => Promise<void>
    GetSubjectById: (subjectId: string) => Promise<Subject>
    GetSubjects: (filter: PaginationFilter) => Promise<{ subjects: Subject[], metadata: PaginationMetaData }>

    AddQuestion: (question: Question) => Promise<void>
    EditQuestion: (questionParams: EditQuestionParams) => Promise<void>
    DeleteQuestion: (id: string) => Promise<void>
    GetQuestionById: (questionId: string) => Promise<Question>
    GetQuestions: (filter: PaginationFilter) => Promise<{ questions: Question[], metadata: PaginationMetaData }> // filer to include subjectId
    GetReportedQuestions: (filter: PaginationFilter) => Promise<{
        questions: QuestionWithReason[],
        metadata: PaginationMetaData
    }> // filer to include subjectId
    GetTaggedQuestions: (filter: PaginationFilter) => Promise<{
        questions: QuestionWithReason[],
        metadata: PaginationMetaData
    }> // filer to include subjectId


    AddQuestionBatch: (examId: string) => Promise<QuestionBatch>
    UpdateQuestionBatchStatus: (id: string, status: QuestionBatchStatus) => Promise<void>
    GetQuestionBatches: (filter: PaginationFilter) => Promise<{
        questionBatches: QuestionBatch[],
        metadata: PaginationMetaData
    }>
    GetQuestionBatchByID: (id: string) => Promise<QuestionBatch>
    TagQuestion: (userId: string, questionId: string) => Promise<void>
    ReportQuestion: (userId: string, questionId: string, reason: string) => Promise<void>
}