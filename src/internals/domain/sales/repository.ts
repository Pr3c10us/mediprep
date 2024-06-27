import {Sale} from "./sale";
import {PaginationFilter, PaginationMetaData} from "../../../pkg/types/pagination";

export interface SalesRepository {
    AddSale : (sale: Sale) => Promise<void>,
    GetSales: (filter:PaginationFilter) => Promise<{sales: Sale[],metadata: PaginationMetaData }>,
    GetSaleDetail: (id: string) => Promise<Sale>
}