import { NextFunction, Request, Response } from "express";
import { AdminRepository } from "../../internals/domain/admins/repository";
import { UnAuthorizedError } from "../errors/customError";
import { Admin } from "../../internals/domain/admins/admin";
import { verifyToken } from "../utils/encryption";

const AuthorizeAdmin = (repository: AdminRepository) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        let { adminToken: token } = req.signedCookies;
        if (!token) {
            token = req.headers.authorization?.split(" ")[1];
        }
        if (!token) throw new UnAuthorizedError("missing token");

        try {
            const payload = verifyToken(token);
            const id = (payload as { id: string }).id;

            const admin: Admin | null = await repository.GetAdminByID(id);
            if (!admin) throw new UnAuthorizedError("invalid token");

            req.admin = admin;
            next();
        } catch (error) {
            throw error;
        }
    };
};

export default AuthorizeAdmin;
