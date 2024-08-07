import {PaginationFilter, PaginationMetaData} from "../../../pkg/types/pagination";
import {Admin} from "./admin";

export interface AdminRepository {
    AddAdmin: (admin: Admin) => Promise<void>;
    RemoveAdmin: (adminId: string) => Promise<void>
    updateAdmin: (admin: Partial<Admin>) => Promise<void>;
    GetAdminByEmail: (email: string) => Promise<Admin | null>;
    GetAdminByID: (id: string) => Promise<Admin | null>;
    GetAdmins: (filter: PaginationFilter) => Promise<{ admins: Admin[], metadata: PaginationMetaData }>;
}
