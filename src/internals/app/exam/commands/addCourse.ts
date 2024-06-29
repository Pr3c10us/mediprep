import {Course} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface AddCourseCommand {
    Handle: (course: Course) => Promise<Course>
}

export class AddCourseCommandC implements AddCourseCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(course: Course): Promise<Course> {
        try {
            return await this.examRepository.AddCourse(course)
        } catch (error) {
            throw error
        }
    }

}