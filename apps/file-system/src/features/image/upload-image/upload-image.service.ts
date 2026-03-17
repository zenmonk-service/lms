import { Injectable, Inject } from '@nestjs/common';
import { StorageService } from 'src/infrastructure/storage/storage-service.interface';

export interface UploadImageResponse {
  success: boolean;
  url?: string;
  error?: string;
}

@Injectable()
export class UploadImageHandler {
  constructor(@Inject('StorageService') private storageHandler: StorageService) {}

  async handle(file: Express.Multer.File): Promise<UploadImageResponse> {
    try {

      if (!file) {
        return {
          success: false,
          error: 'No file uploaded'
        };
      }

      const url = await this.storageHandler.uploadFile(file.originalname, file);

      return {
        success: true,
        url
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'An error occurred while uploading the file'
      };
    }
  }
}
