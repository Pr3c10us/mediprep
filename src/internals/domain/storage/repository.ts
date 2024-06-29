export interface StorageRepository {
    upload : ( file: Express.Multer.File, containerName:string,blobName?: string) => Promise<{fileURL: string,blobName:string}>
    // downloadStream: (blobName)
}