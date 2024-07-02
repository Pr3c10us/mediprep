import {UserExamAccessRepository} from "../../../../../domain/examAccess/repository";
import {PaginationFilter, PaginationMetaData} from "../../../../../../pkg/types/pagination";
import {Course, Exam} from "../../../../../domain/exams/exam";
import {and, count, eq, ilike} from "drizzle-orm";
import * as schemaExam from "../../../../../../../stack/drizzle/schema/exams";
import {Exams, Questions} from "../../../../../../../stack/drizzle/schema/exams";
import {PoolClient} from "pg";
import {drizzle} from "drizzle-orm/node-postgres";
import * as schemaUser from "../../../../../../../stack/drizzle/schema/users"
import {UserExamAccess as UserExamAccesses} from "../../../../../../../stack/drizzle/schema/users"
import {BadRequestError, UnAuthorizedError} from "../../../../../../pkg/errors/customError";

export class UserExamAccessRepositoryDrizzle implements UserExamAccessRepository {
    db

    constructor(pool: PoolClient) {
        this.db = drizzle(pool, {schema: {...schemaExam, ...schemaUser}})
    }

    getExamAccessDetail = async (userId: string, examId: string): Promise<{
        exam: Exam,
        metadata: PaginationMetaData
    }> => {
        try {
            const result = await this.db.query.UserExamAccess.findFirst({
                where: and(eq(UserExamAccesses.userId, userId), eq(UserExamAccesses.examId, examId)),
                with: {
                    exam: true
                }
            })

            if (!result ) {
                throw new UnAuthorizedError("User does not have access to exam")
            }
            if (new Date(result.expiryDate) < new Date()) {
                throw new UnAuthorizedError("User access to exam has lapsed")
            }
            const totalQuestions = await this.db.select({count: count()}).from(Questions).where(eq(Questions.examId, result.exam.id as string));
            //     Mock Analytics

            return {
                exam: {
                    id: result.exam.id as string,
                    name: result.exam.name as string,
                    description: result.exam.description as string,
                    subscriptionAmount: result.exam.subscriptionAmount as number,
                    imageURL: result.exam.imageURL as string,
                    mockQuestions: result.exam.mockQuestions as number,
                    createdAt: result.exam.createdAt as Date,
                    updatedAt: result.exam.updatedAt as Date
                },
                metadata: {
                    totalQuestions: totalQuestions[0].count,
                    expiryDate: result.expiryDate
                }
            }

        } catch (error) {
            throw error
        }
    }

    getExams = async (filter: PaginationFilter): Promise<{ exams: Exam[]; metadata: PaginationMetaData }> => {
        try {
            const filters: string | any[] = [];
            if (filter.name || filter.name != undefined) {
                filters.push(ilike(Exams.name, `%${filter.name}%`));
            }

            // Get the total count of rows
            const totalResult = await this.db.select({count: count()}).from(UserExamAccesses);
            const total = totalResult[0].count;
            if (total <= 0) {
                return {
                    exams: [], metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }

            const rows = await this.db.query.Exams.findMany({
                where: and(...filters),
                with: {
                    userExamAccess: {
                        where: eq(UserExamAccesses.userId, filter.userId as string)
                    }
                },
                limit: filter.limit,
                offset: (filter.page - 1) * filter.limit
            })

            if (rows.length > 0) {
                return {
                    exams: rows.map((row) => {
                        return {
                            id: row.id as string,
                            name: row.name as string,
                            description: row.description as string,
                            subscriptionAmount: row.subscriptionAmount as number,
                            imageURL: row.imageURL as string,
                            createdAt: row.createdAt as Date,
                            updatedAt: row.updatedAt as Date
                        }
                    }), metadata: {
                        total: total,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }

            return {
                exams: [], metadata: {
                    total: 0,
                    perPage: filter.limit,
                    currentPage: filter.page
                }
            };

        } catch (error) {
            throw error
        }
    }

}