import { Admin } from "./admin";

export interface AdminRepository {
    AddAdmin: (admin: Admin) => Promise<void>;
    GetAdminByEmail: (email: string) => Promise<Admin | null>;
    GetAdminByID: (id: string) => Promise<Admin | null>;
}
