import { Adapter } from "../infrastructure/adapters/adapters";
import { AdminServices } from "./admin/admin";

export class Services {
    AdminServices: AdminServices;

    constructor(adapter: Adapter) {
        this.AdminServices = new AdminServices(adapter.AdminRepository);
    }
}
