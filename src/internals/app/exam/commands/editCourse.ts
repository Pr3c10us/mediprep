import {Course} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface EditCourseCommand {
    Handle: (course: Course) => Promise<void>
}

export class EditCourseCommandC implements EditCourseCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(course: Course): Promise<void> {
        try {
            const courseResult = await this.examRepository.GetCourseById(course.id as string)
            await this.examRepository.EditCourseName(courseResult.id as string,course.name)
        } catch (error) {
            throw error
        }
    }

}
