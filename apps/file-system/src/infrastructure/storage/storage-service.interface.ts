export interface StorageService {
    uploadFile(filePath:string, file: Express.Multer.File): Promise<string>;
    deleteFile(filePath: string): Promise<void>;
}