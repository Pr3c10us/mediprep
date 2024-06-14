import {BlobServiceClient} from "@azure/storage-blob";
import {ClientSecretCredential} from "@azure/identity";
import {Environment} from "../configs/env";

export const getBlobClient = (environmentVariable: Environment): BlobServiceClient => {
    return new BlobServiceClient(
        `https://${environmentVariable.azAccountStorageName}.blob.core.windows.net`,
        new ClientSecretCredential(environmentVariable.azTenantId,
            environmentVariable.azClientId,
            environmentVariable.azClientSecret)
    )
}