import {AddSaleParams, Sale, SaleItem} from "./sale";
import {PaginationFilter, PaginationMetaData} from "../../../pkg/types/pagination";

export interface UserExamAccessRepository {
    AddSaleByItems: (item: SaleItem,userID: string) => Promise<string>
    AddSale: (params: AddSaleParams) => Promise<{ totalPrice: number, saleID: string }>,
    UpdateSale: (params: Partial<Sale>) => Promise<void>,
    GetSales: (filter: PaginationFilter) => Promise<{ sales: Sale[], metadata: PaginationMetaData }>,
    GetSaleDetail: (id: string) => Promise<Sale>
    GetSaleByReference: (reference: string) => Promise<Sale>
}