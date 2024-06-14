import {StorageRepository} from "../../../../domain/storage/repository";
import {BlobServiceClient, BlockBlobClient, ContainerClient} from "@azure/storage-blob";
import {Environment} from "../../../../../pkg/configs/env";
import path from "path";

export class AzureStorageRepository implements StorageRepository {
    blobClient: BlobServiceClient
    environmentVariable: Environment

    constructor(blobClient: BlobServiceClient, environmentVariable: Environment) {
        this.blobClient = blobClient
        this.environmentVariable = environmentVariable
    }

    uploadExamImage = async (blobName: string, file: Express.Multer.File) => {
        let blobNameWithExtension = `${blobName}${path.extname(file.originalname)}`
        const containerClient: ContainerClient = this.blobClient.getContainerClient(this.environmentVariable.azExamContainerName)
        const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobNameWithExtension)

        await blockBlobClient.uploadFile(file.path)

        return `https://${this.environmentVariable.azAccountStorageName}.blob.core.windows.net/${this.environmentVariable.azExamContainerName}/${blobNameWithExtension}`
    }
}