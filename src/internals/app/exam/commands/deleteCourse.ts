import {ExamRepository} from "../../../domain/exams/repository";

export interface DeleteCourseCommand {
    Handle: (courseId: string) => Promise<void>
}

export class DeleteCourseCommandC implements DeleteCourseCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(courseId: string): Promise<void> {
        try {
            const course = await this.examRepository.GetCourseById(courseId)
            await this.examRepository.DeleteCourse(course.id as string)
        } catch (error) {
            throw error
        }
    }

}
