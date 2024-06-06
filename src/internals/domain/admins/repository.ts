import { Admin } from "./admin";

export interface AdminRepository {
    AddAdmin: (admin: Admin) => Promise<Admin>;
}
