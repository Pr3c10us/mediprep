import { NotFoundError } from "../../../../../pkg/errors/customError";
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
            const query = `
            INSERT INTO admin (name,email,password,roles,exam_access) VALUES ($1,$2,$3,$4,$5)
        `;
            const values = [
                admin.name,
                admin.email,
                admin.password,
                admin.roles,
                admin.examAccess,
            ];
            await this.dbClient.query(query, values);
            return;
        } catch (error) {
            throw error;
        }
    };

    GetAdminByEmail = async (email: string): Promise<Admin | null> => {
        try {
            const query = `
                SELECT * FROM admin WHERE email=$1;
            `;
            const values = [email];
            const { rows } = await this.dbClient.query(query, values);
            if (rows.length > 0) {
                const result = rows[0];
                const admin: Admin = newAdmin(
                    result.name,
                    result.email,
                    result.roles,
                    result.id,
                    result.password,
                    result.exam_access,
                    result.created_at,
                    result.updated_at
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
            const query = `
                SELECT * FROM admin WHERE id=$1;
            `;
            const values = [id];
            const { rows } = await this.dbClient.query(query, values);
            if (rows.length > 0) {
                const result = rows[0];
                const admin: Admin = newAdmin(
                    result.name,
                    result.email,
                    result.roles,
                    result.id,
                    result.password,
                    result.exam_access,
                    result.created_at,
                    result.updated_at
                );
                return admin;
            }
            return null;
        } catch (error) {
            throw error;
        }
    };
}
