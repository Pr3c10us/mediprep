import {UserRepository} from "../../../../../domain/users/repository";
import {EditUser, User, UserExamAccess as UEA} from "../../../../../domain/users/user";
import {PaginationFilter, PaginationMetaData} from "../../../../../../pkg/types/pagination";
import {drizzle} from "drizzle-orm/node-postgres";
import {PoolClient} from "pg";
import * as schema from "../../../../../../../stack/drizzle/schema/users"
import {UserExamAccess, Users} from "../../../../../../../stack/drizzle/schema/users"
import {and, count, eq, gte, ilike, lte, ne} from "drizzle-orm";
import {BadRequestError} from "../../../../../../pkg/errors/customError";
import {Sales} from "../../../../../../../stack/drizzle/schema/sales";
import {Tests} from "../../../../../../../stack/drizzle/schema/test";


export class UserRepositoryDrizzle implements UserRepository {
    db

    constructor(client: PoolClient) {
        this.db = drizzle(client, {schema})
    }

    addUser = async (user: User): Promise<User> => {
        try {
            const result = await this.db.insert(Users).values({
                firstName: user.firstName as string,
                lastName: user.lastName as string,
                email: user.email as string,
                password: user.password as string,
                country: user.country as string,
                profession: user.profession as string,
                blacklisted: user.blacklisted,
                verified: user.verified ? user.verified : false
            }).returning()

            return {
                id: result[0].id as string,
                firstName: result[0].firstName as string,
                lastName: result[0].lastName as string,
                email: result[0].email as string,
                password: result[0].password as string,
                country: result[0].country as string,
                verified: result[0].verified as boolean,
                profession: result[0].profession as string,
                blacklisted: result[0].blacklisted,
                createdAt: result[0].createdAt as Date,
                updatedAt: result[0].updatedAt as Date
            }
        } catch (error) {
            throw error
        }
    }

    updateUser = async (user: Partial<User>): Promise<User> => {
        try {
            const result = await this.db.update(Users).set(user).where(eq(Users.id, user.id as string)).returning()

            return {
                id: result[0].id as string,
                firstName: result[0].firstName as string,
                lastName: result[0].lastName as string,
                email: result[0].email as string,
                password: result[0].password as string,
                country: result[0].country as string,
                verified: result[0].verified as boolean,
                profession: result[0].profession as string,
                blacklisted: result[0].blacklisted,
                createdAt: result[0].createdAt as Date,
                updatedAt: result[0].updatedAt as Date
            }
        } catch (error) {
            throw error
        }
    }

    deleteUserDetails = async (id: string): Promise<void> => {
        try {
            await this.db.delete(Users).where(eq(Users.id, id))
        } catch (error) {
            throw error
        }
    }

    editUser = async (id: string, userParams: EditUser): Promise<void> => {
        try {
            const updatedUser = await this.db.update(Users).set(userParams).where(eq(Users.id, id)).returning({id: Users.id})
            if (updatedUser.length < 1) {
                throw new BadRequestError(`user with id '${id}' does not exist`)
            }
        } catch (error) {
            throw error
        }
    }

    getUserDetails = async (id: string): Promise<User> => {
        try {
            const user = await this.db.query.Users.findFirst({
                where: (eq(Users.id, id))
            })
            if (!user) {
                throw new BadRequestError(`user with id '${id}' does not exist`)
            }

            return {
                id: user.id as string,
                firstName: user.firstName as string,
                lastName: user.lastName as string,
                email: user.email as string,
                password: user.password as string,
                country: user.country as string,
                verified: user.verified as boolean,
                profession: user.profession as string,
                blacklisted: user.blacklisted,
                createdAt: user.createdAt as Date,
                updatedAt: user.updatedAt as Date
            }
        } catch (error) {
            throw error
        }
    }

    getUserDetailsWithAnalytics = async (id: string): Promise<User> => {
        try {
            const user = await this.db.query.Users.findFirst({
                where: (eq(Users.id, id))
            })
            if (!user) {
                throw new BadRequestError(`user with id '${id}' does not exist`)
            }

            const sales = await this.db.select().from(Sales).where(eq(Sales.userId, id))
            const test = await this.db.select().from(Tests).where(and(eq(Tests.userId, id), ne(Tests.type, "mock")))
            const mock = await this.db.select().from(Tests).where(and(eq(Tests.userId, id), eq(Tests.type, "mock")))


            return {
                id: user.id as string,
                firstName: user.firstName as string,
                lastName: user.lastName as string,
                email: user.email as string,
                password: user.password as string,
                country: user.country as string,
                verified: user.verified as boolean,
                profession: user.profession as string,
                blacklisted: user.blacklisted,
                createdAt: user.createdAt as Date,
                updatedAt: user.updatedAt as Date,
                examsBought: sales.length,
                testNo: test.length,
                mockNo: mock.length
            }
        } catch (error) {
            throw error
        }
    }

    getUserByEmail = async (email: string): Promise<User> => {
        try {
            const user = await this.db.query.Users.findFirst({
                where: (eq(Users.email, email))
            })
            if (!user) {
                throw new BadRequestError(`user with email '${email}' does not exist`)
            }

            return {
                id: user.id as string,
                firstName: user.firstName as string,
                lastName: user.lastName as string,
                email: user.email as string,
                password: user.password as string,
                country: user.country as string,
                verified: user.verified as boolean,
                profession: user.profession as string,
                blacklisted: user.blacklisted,
                createdAt: user.createdAt as Date,
                updatedAt: user.updatedAt as Date
            }
        } catch (error) {
            throw error
        }
    }

    getUsers = async (filter: PaginationFilter): Promise<{ users: User[]; metadata: PaginationMetaData }> => {
        try {
            let filters = []
            if (filter.firstName || filter.firstName != undefined) {
                filters.push(ilike(Users.firstName, `%${filter.firstName}%`))
            }
            if (filter.lastName || filter.lastName != undefined) {
                filters.push(ilike(Users.lastName, `%${filter.lastName}%`))
            }
            if (filter.email || filter.email != undefined) {
                filters.push(ilike(Users.email, `%${filter.email}%`))
            }
            if (filter.profession || filter.profession != undefined) {
                filters.push(ilike(Users.profession, `%${filter.profession}%`))
            }
            if (filter.country || filter.country != undefined) {
                filters.push(ilike(Users.country, `%${filter.country}%`))
            }

            if (filter.profession || filter.profession != undefined) {
                filters.push(ilike(Users.profession, `%${filter.profession}%`))
            }
            if (filter.startDate || filter.startDate != undefined) {
                filters.push(gte(Users.createdAt, filter.startDate as Date))
            }
            if (filter.endDate || filter.endDate != undefined) {
                filters.push(lte(Users.createdAt, filter.endDate as Date))
            }

            // Get the total count of rows
            const totalResult = await this.db.select({count: count()}).from(Users).where(and(...filters));
            const total = totalResult[0].count;
            if (total <= 0) {
                return {
                    users: [], metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }
            const query = this.db.select().from(Users);

            if (filters.length > 0) {
                query.where(and(...filters)).orderBy(Users.createdAt);
            }
            const users = await query
                .limit(filter.limit)
                .offset((filter.page - 1) * filter.limit);
            if (users.length > 0) {
                return {
                    users: users.map((user) => {
                        return {
                            id: user.id as string,
                            firstName: user.firstName as string,
                            lastName: user.lastName as string,
                            email: user.email as string,
                            password: user.password as string,
                            country: user.country as string,
                            profession: user.profession as string,
                            blacklisted: user.blacklisted,
                            verified: user.verified as boolean,
                            createdAt: user.createdAt as Date,
                            updatedAt: user.updatedAt as Date
                        }
                    }), metadata: {
                        total: total,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }
            return {users: [], metadata: {total: 0, perPage: filter.limit, currentPage: filter.page}}
        } catch (error) {
            throw error
        }
    }

    addUserExamAccess = async (examToUser: UEA): Promise<void> => {
        try {
            await this.db.insert(UserExamAccess).values({
                userId: examToUser.userId,
                examId: examToUser.examId,
                expiryDate: examToUser.expiryDate as Date
            })
        } catch (error) {
            throw error
        }
    }

    updateExamAccess = async (examToUser: UEA): Promise<void> => {
        try {
            await this.db.update(UserExamAccess).set({
                expiryDate: examToUser.expiryDate
            }).where((and(eq(UserExamAccess.userId, examToUser.userId), eq(UserExamAccess.examId, examToUser.examId))))
        } catch (error) {
            throw error
        }
    }

    getUserExamAccess = async (examId: string, userId: string): Promise<UEA> => {
        try {
            const userExamAccess = await this.db.query.UserExamAccess.findFirst({
                where: (and(eq(UserExamAccess.userId, userId), eq(UserExamAccess.examId, examId))),
            })
            if (!userExamAccess) {
                throw new BadRequestError(`user does with id ${userId} does not have access to exam ${examId}`)
            }
            return {
                userId: userExamAccess.userId,
                examId: userExamAccess.examId,
                expiryDate: userExamAccess.expiryDate
            }

        } catch (error) {
            throw error
        }
    }
}