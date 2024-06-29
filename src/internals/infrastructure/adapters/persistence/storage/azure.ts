import {StorageRepository} from "../../../../domain/storage/repository";
import {BlobServiceClient, BlockBlobClient, ContainerClient} from "@azure/storage-blob";
import {Environment} from "../../../../../pkg/configs/env";
import path from "path";
import {unlink} from "node:fs/promises";
import { v4 } from "uuid";


export class AzureStorageRepository implements StorageRepository {
    blobClient: BlobServiceClient
    environmentVariable: Environment

    constructor(blobClient: BlobServiceClient, environmentVariable: Environment) {
        this.blobClient = blobClient
        this.environmentVariable = environmentVariable
    }

    upload = async ( file: Express.Multer.File, containerName:string,blobName?: string,):Promise<{fileURL: string,blobName:string}> => {
        blobName = blobName ? blobName : v4()
        let blobNameWithExtension = `${blobName}${path.extname(file.originalname)}`
        const containerClient: ContainerClient = this.blobClient.getContainerClient(containerName)
        const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobNameWithExtension)

        await blockBlobClient.uploadFile(file.path)
        await unlink(file.path)
        return {
            fileURL: `https://${this.environmentVariable.azAccountStorageName}.blob.core.windows.net/${this.environmentVariable.azExamImageContainerName}/${blobNameWithExtension}`,
            blobName: blobNameWithExtension
        }
    }
}