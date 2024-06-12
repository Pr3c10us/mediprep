import { NotFoundError } from "../../../../../pkg/errors/customError";
import {
    AddAdminQuery,
    GetAdminByEmailQuery,
    GetAdminByIDQuery,
    GetAdminsWithFilterQuery,
} from "../../../../../pkg/sqlQueries/admin";
import { PaginationFilter } from "../../../../../pkg/types/pagination";
import { Admin, newAdmin } from "../../../../domain/admins/admin";
import { AdminRepository } from "../../../../domain/admins/repository";
import { PoolClient } from "pg";

export class AdminRepositoryPG implements AdminRepository {
    dbClient: PoolClient;

    constructor(dbClient: PoolClient) {
        this.dbClient = dbClient;
    }

    AddAdmin = async (admin: Admin): Promise<void> => {
        try {
            const values = [
                admin.name,
                admin.email,
                admin.password,
                admin.roles,
                admin.examAccess,
            ];
            await this.dbClient.query(AddAdminQuery, values);
            return;
        } catch (error) {
            throw error;
        }
    };

    GetAdminByEmail = async (email: string): Promise<Admin | null> => {
        try {
            const values = [email];
            const { rows } = await this.dbClient.query(
                GetAdminByEmailQuery,
                values
            );
            if (rows.length > 0) {
                const result = rows[0];
                const admin: Admin = newAdmin(
                    result.admin_name,
                    result.admin_email,
                    result.admin_roles,
                    result.admin_id,
                    result.admin_password,
                    result.admin_created_at,
                    result.admin_updated_at,
                    result.exams
                );
                return admin;
            }
            return null;
        } catch (error) {
            throw error;
        }
    };

    GetAdminByID = async (id: string): Promise<Admin | null> => {
        try {
            const values = [id];
            const { rows } = await this.dbClient.query(
                GetAdminByIDQuery,
                values
            );
            if (rows.length > 0) {
                const result = rows[0];
                const admin: Admin = newAdmin(
                    result.admin_name,
                    result.admin_email,
                    result.admin_roles,
                    result.admin_id,
                    result.admin_password,
                    result.admin_created_at,
                    result.admin_updated_at,
                    result.exams
                );
                return admin;
            }
            return null;
        } catch (error) {
            throw error;
        }
    };

    GetAdmins = async (filter: PaginationFilter): Promise<Admin[]> => {
        try {
            console.log(filter);
            const values = [
                filter.limit,
                filter.page - 1,
                filter.name,
                filter.email,
            ];
            const { rows } = await this.dbClient.query(
                GetAdminsWithFilterQuery,
                values
            );
            if (rows.length > 0) {
                const results: Admin[] = rows.map((row) => {
                    const admin: Admin = newAdmin(
                        row.name,
                        row.email,
                        row.roles,
                        row.id,
                        row.password,
                        row.created_at,
                        row.updated_at,
                        row.exams
                    );
                    return admin;
                });
                return results;
            }
            return rows;
        } catch (error) {
            throw error;
        }
    };
}
