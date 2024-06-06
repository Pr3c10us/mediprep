import { NotFoundError } from "../../../../../pkg/errors/customError";
import { Admin } from "../../../../domain/admins/admin";
import { AdminRepository } from "../../../../domain/admins/repository";
import { PoolClient } from "pg";

export class AdminRepositoryPG implements AdminRepository {
    dbClient: PoolClient;

    constructor(dbClient: PoolClient) {
        this.dbClient = dbClient;
    }

    AddAdmin = async (admin: Admin): Promise<Admin> => {
        try {
            const query = `
            INSERT INTO admin (name,email,roles,exam_access) VALUES ($1,$2,$3,$4) RETURNING *
        `;
            const values = [
                admin.name,
                admin.email,
                admin.roles,
                admin.examAccess,
            ];
            const { rows } = await this.dbClient.query(query, values);
            return rows[0] as Admin;
        } catch (error) {
            throw error;
        }
    };
}
