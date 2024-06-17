import { Admin } from "../../internals/domain/admins/admin";
import {User} from "../../internals/domain/users/user";

declare global {
    namespace Express {
        interface Request {
            admin?: Admin;
            user?: User;
            signedCookies?: any;
        }
    }
}
