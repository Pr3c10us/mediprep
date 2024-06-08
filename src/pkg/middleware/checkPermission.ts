import { NextFunction, Request, Response } from "express";
import { Permission, Roles } from "../RBAC/role";
import { UnAuthorizedError } from "../errors/customError";

const CheckPermission = (permission: Permission) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.admin) {
            const admin = req.admin;
            if (!admin) {
                throw new UnAuthorizedError("access denied");
            }
            const adminRoles =
                admin.roles.length < 1 ? ["viewer"] : admin.roles;

            const adminPermissions = adminRoles
                .map((role: string) => {
                    const permission = Roles.getRoleByName(role)?.permissions;
                    return permission;
                })
                .flat()
                .filter((perm): perm is Permission => perm !== undefined);
            if (adminPermissions.includes(permission)) {
                next();
            } else {
                throw new UnAuthorizedError("access denied");
            }
        } else {
            throw new UnAuthorizedError("access denied");
        }
    };
};

export default CheckPermission;
