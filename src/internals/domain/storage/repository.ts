export interface StorageRepository {
    uploadExamImage : (blobName: string, file: Express.Multer.File) => Promise<string>
}