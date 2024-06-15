import {PaginationFilter, PaginationMetaData} from "../../../../pkg/types/pagination";
import {Admin} from "../../../domain/admins/admin";
import {AdminRepository} from "../../../domain/admins/repository";

export interface GetAdminsQuery {
    handle: (filter: PaginationFilter) => Promise<{ admins: Admin[], metadata: PaginationMetaData }>
}


export class GetAdminsQueryC implements GetAdminsQuery{
    adminRepository: AdminRepository;

    constructor(adminRepository: AdminRepository) {
        this.adminRepository = adminRepository;
    }

    handle = async (filter: PaginationFilter): Promise<{ admins: Admin[], metadata: PaginationMetaData }> => {
        try {
            const {admins, metadata} = await this.adminRepository.GetAdmins(
                filter
            );
            return {admins, metadata};
        } catch (error) {
            throw error
        }
    };
}
