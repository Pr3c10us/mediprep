import {AdminRepository} from "../../../../../domain/admins/repository";
import {NodePgDatabase} from "drizzle-orm/node-postgres";
import {Admin, newAdmin} from "../../../../../domain/admins/admin";
import {PaginationFilter, PaginationMetaData} from "../../../../../../pkg/types/pagination";
import {Admins} from "../../../../../../../stack/drizzle/schema/admins"
import {and, eq, ilike, sql} from "drizzle-orm";
import {BadRequestError} from "../../../../../../pkg/errors/customError";
import {ExamAccess} from "../../../../../../../stack/drizzle/schema/exams";

export class AdminRepositoryDrizzle implements AdminRepository {

    db: NodePgDatabase

    constructor(db: NodePgDatabase) {
        this.db = db
    }

    AddAdmin = async (adminParams: Admin): Promise<void> => {
        try {
            await this.db.transaction(async (tx) => {
                try {
                    const newAdminResults = await tx.insert(Admins).values({
                        name: adminParams.name,
                        email: adminParams.email,
                        password: adminParams.password,
                        roles: adminParams.roles as string[],
                    }).returning()
                    const newAdmin = newAdminResults[0]
                    if (adminParams.examAccess != undefined && adminParams.examAccess.length > 0) {
                        for await (let examId of adminParams.examAccess) {
                            const examRes = await tx.select({id: Admins.id}).from(Admins).where(eq(Admins.id, examId))
                            const examExist = examRes[0]
                            if (!examExist) {
                                try {
                                    tx.rollback()
                                } catch (error) {
                                    throw new BadRequestError(`exam with exam id '${examId}' does not exist`)
                                }
                            }

                            await tx.insert(ExamAccess).values({
                                adminId: newAdmin.id as string,
                                examId: examExist.id as string
                            })
                        }
                    }
                    return;
                } catch (error) {
                    tx.rollback()
                }
            })
        } catch (error) {
            throw error;
        }
    };

    GetAdminByEmail = async (email: string): Promise<Admin | null> => {
        try {
            const adminData = await this.db.select().from(Admins).where(eq(Admins.email, email))
            if (adminData.length > 0) {
                const firstResult = adminData[0]
                return newAdmin(firstResult.name, firstResult.email, firstResult.roles, firstResult.id, firstResult.password, firstResult.createdAt, firstResult.updatedAt)
            }
            return null;
        } catch (error) {
            throw error;
        }
    };

    GetAdminByID = async (id: string): Promise<Admin | null> => {
        try {
            const adminData = await this.db.select().from(Admins).where(eq(Admins.id, id))
            if (adminData.length > 0) {
                const firstResult = adminData[0]
                return newAdmin(firstResult.name, firstResult.email, firstResult.roles, firstResult.id, firstResult.password, firstResult.createdAt, firstResult.updatedAt)
            }
            return null;
        } catch (error) {
            throw error;
        }
    };

    GetAdmins = async (filter: PaginationFilter): Promise<{ admins: Admin[], metadata: PaginationMetaData }> => {
        try {
            // Get the total count of rows
            const totalResult = await this.db.select({count: sql`count(*)`}).from(Admins);
            const total = parseInt(<string>totalResult[0].count || '0', 10);
            if (total <= 0) {
                return {
                    admins: [], metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }

            const filters: string | any[] = [];
            if (filter.name || filter.name != undefined) {
                filters.push(ilike(Admins.name, `%${filter.name}%`));
            }
            if (filter.email || filter.email != undefined) {
                filters.push(ilike(Admins.email, `%${filter.email}%`));
            }


            const query = this.db.select().from(Admins);

            if (filters.length > 0) {
                query.where(and(...filters));
            }
            const rows = await query
                .limit(filter.limit)
                .offset((filter.page - 1) * filter.limit); // Assuming filter.page is 1-based

            if (rows.length > 0) {
                return {
                    admins: rows.map((row) => {
                        const adminData = newAdmin(
                            row.name,
                            row.email,
                            row.roles,
                            row.id,
                            row.password,
                            row.createdAt,
                            row.updatedAt,
                        );
                        delete adminData.password
                        return adminData
                    }), metadata: {
                        total: total,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }
            return {
                admins: [], metadata: {
                    total: 0,
                    perPage: filter.limit,
                    currentPage: filter.page
                }
            };
        } catch (error) {
            throw error;
        }
    };

}
