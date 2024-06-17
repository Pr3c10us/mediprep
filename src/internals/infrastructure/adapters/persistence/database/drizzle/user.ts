import {UserRepository} from "../../../../../domain/users/repository";
import {EditUser, User} from "../../../../../domain/users/user";
import {PaginationFilter, PaginationMetaData} from "../../../../../../pkg/types/pagination";
import {drizzle} from "drizzle-orm/node-postgres";
import {PoolClient} from "pg";
import * as schema from "../../../../../../../stack/drizzle/schema/users"
import {Users} from "../../../../../../../stack/drizzle/schema/users"
import {and, count, eq, ilike} from "drizzle-orm";
import {BadRequestError} from "../../../../../../pkg/errors/customError";


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
                query.where(and(...filters));
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

}