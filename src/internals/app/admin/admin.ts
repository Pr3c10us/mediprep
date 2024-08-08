import {AdminRepository} from "../../domain/admins/repository";
import {QueueRepository} from "../../domain/queue/repository";
import {AddAdminCommand, AddAdminCommandC} from "./command/addAdmin";
import {AuthenticateAdmin, AuthenticateAdminC,} from "./command/authenticateAdmin";
import {GetAdminsQuery, GetAdminsQueryC} from "./query/getAdmins";
import {RemoveAdminCommand, RemoveAdminCommandC} from "./command/removeAdmin";
import {UpdateAdminCommand, UpdateAdminCommandC} from "./command/updateAdmin";
import {ChangeAdminPasswordCommand, ChangeAdminPasswordCommandC} from "./command/changePassword";

export class Commands {
    addAdmin: AddAdminCommand;
    removeAdmin: RemoveAdminCommand
    updateAdmin: UpdateAdminCommand
    changePassword: ChangeAdminPasswordCommand
    authenticateAdmin: AuthenticateAdmin;

    constructor(
        adminRepository: AdminRepository,
        emailQueueRepository: QueueRepository
    ) {
        this.addAdmin = new AddAdminCommandC(
            adminRepository,
            emailQueueRepository
        );
        this.removeAdmin = new RemoveAdminCommandC(adminRepository)
        this.updateAdmin = new UpdateAdminCommandC(adminRepository)
        this.changePassword = new ChangeAdminPasswordCommandC(adminRepository)
        this.authenticateAdmin = new AuthenticateAdminC(adminRepository);
    }
}

export class Queries {
    getAdmins: GetAdminsQuery;

    constructor(adminRepository: AdminRepository) {
        this.getAdmins = new GetAdminsQueryC(adminRepository);
    }
}

export class AdminServices {
    commands: Commands;
    queries: Queries;
    adminRepository: AdminRepository;

    constructor(
        adminRepository: AdminRepository,
        emailQueueRepository: QueueRepository
    ) {
        this.adminRepository = adminRepository;
        this.commands = new Commands(adminRepository, emailQueueRepository);
        this.queries = new Queries(adminRepository);
    }
}
