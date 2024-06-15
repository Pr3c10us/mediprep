import {Course} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface AddCourseCommand {
    Handle: (course: Course) => Promise<void>
}

export class AddCourseCommandC implements AddCourseCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(course: Course): Promise<void> {
        try {
            await this.examRepository.AddCourse(course.examId as string,course)
        } catch (error) {
            throw error
        }
    }

}