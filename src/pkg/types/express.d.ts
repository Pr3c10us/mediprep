import { Admin } from "../../internals/domain/admins/admin";
import {User} from "../../internals/domain/users/user";
import {Exam} from "../../internals/domain/exams/exam";

declare global {
    namespace Express {
        interface Request {
            admin?: Admin;
            user?: User;
            signedCookies?: any;
            userExamAccess? : {exam: Exam, metadata: PaginationMetaData}
        }
    }
}
