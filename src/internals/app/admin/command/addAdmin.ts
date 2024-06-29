import { BadRequestError } from "../../../../pkg/errors/customError";
import { encrypt } from "../../../../pkg/utils/encryption";
import { generateRandomPassword } from "../../../../pkg/utils/generateValue";
import { Admin } from "../../../domain/admins/admin";
import { AdminRepository } from "../../../domain/admins/repository";
import { Email } from "../../../domain/notification/email";
import { Record, newEmailQueueRecord } from "../../../domain/queue/producer";
import { QueueRepository } from "../../../domain/queue/repository";

export interface AddAdminCommand {
    Handle: (admin: Admin) => Promise<string | void>;
}

export class AddAdminCommandC implements AddAdminCommand {
    adminRepository: AdminRepository;
    emailQueueRepository: QueueRepository;

    constructor(
        adminRepository: AdminRepository,
        emailQueueRepository: QueueRepository
    ) {
        this.adminRepository = adminRepository;
        this.emailQueueRepository = emailQueueRepository;
    }

    Handle = async (admin: Admin): Promise<string | void> => {
        try {
            const emailExist = await this.adminRepository.GetAdminByEmail(
                admin.email
            );
            if (emailExist) {
                throw new BadRequestError(`email address ${admin.email} used`);
            }
            const generatedPassword = admin.password
                ? admin.password
                : generateRandomPassword();

            admin.password = await encrypt(generatedPassword);

            await this.adminRepository.AddAdmin(admin);
            // Send credentials to mail by publishing message to queue
            const email: Email = {
                subject: "Admin Credentials",
                mailTo: [admin.email],
                plainText: `
                You have been added as an Admin to MEDIPREP, here are your required login details:\n 
                email: ${admin.email} \n
                password: ${generatedPassword}
                `,
            };
            const emailQueueRecord: Record = newEmailQueueRecord(email);
            await this.emailQueueRepository.Produce(emailQueueRecord);

            return generatedPassword;
        } catch (error) {
            throw error;
        }
    };
}
