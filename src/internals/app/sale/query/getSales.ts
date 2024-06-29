import {PaginationFilter, PaginationMetaData} from "../../../../pkg/types/pagination";
import {Sale} from "../../../domain/sales/sale";
import {SalesRepository} from "../../../domain/sales/repository";

export interface GetSalesQuery {
    handle: (filter: PaginationFilter) => Promise<{ sales: Sale[], metadata: PaginationMetaData }>
}

export class GetSalesQueryC implements GetSalesQuery{
    saleRepository: SalesRepository;

    constructor(saleRepository: SalesRepository) {
        this.saleRepository = saleRepository;
    }

    handle = async (filter: PaginationFilter): Promise<{ sales: Sale[], metadata: PaginationMetaData }> => {
        try {
            const {sales, metadata} = await this.saleRepository.GetSales(
                filter
            );
            return {sales, metadata};
        } catch (error) {
            throw error
        }
    };
}
