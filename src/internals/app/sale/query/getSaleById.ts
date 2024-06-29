import {PaginationFilter, PaginationMetaData} from "../../../../pkg/types/pagination";
import {Sale} from "../../../domain/sales/sale";
import {SalesRepository} from "../../../domain/sales/repository";

export interface GetSaleByIDQuery {
    handle: (id: string) => Promise<Sale>
}

export class GetSaleByIDQueryC implements GetSaleByIDQuery{
    saleRepository: SalesRepository;

    constructor(saleRepository: SalesRepository) {
        this.saleRepository = saleRepository;
    }

    handle = async (id: string): Promise<Sale> => {
        try {
            const sale = await this.saleRepository.GetSaleDetail(
                id
            );
            return sale;
        } catch (error) {
            throw error
        }
    };
}