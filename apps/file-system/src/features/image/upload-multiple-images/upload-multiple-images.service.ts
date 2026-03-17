import { Injectable, Inject } from '@nestjs/common';
import { StorageService } from 'src/infrastructure/storage/storage-service.interface';

export interface UploadMultipleImagesResponse {
  success: boolean;
  urls?: string[];
  error?: string;
}

@Injectable()
export class UploadMultipleImagesHandler {
  constructor(@Inject('StorageService') private storageHandler: StorageService) {}

  async handle(files: Express.Multer.File[]): Promise<UploadMultipleImagesResponse> {
    try {
      console.log(`Processing multiple file upload: ${files?.length} files`);

      if (!files || files.length === 0) {
        return {
          success: false,
          error: 'No files uploaded'
        };
      }

      // Upload each file and collect the URLs
      const uploadPromises = files.map(file => 
        this.storageHandler.uploadFile(file.originalname, file)
      );

      const urls = await Promise.all(uploadPromises);
      console.log('All files uploaded successfully, URLs:', urls);

      return {
        success: true,
        urls
      };
    } catch (error) {
      console.error('Error in UploadMultipleImagesHandler:', error);
      return {
        success: false,
        error: error.message || 'An error occurred while uploading the files'
      };
    }
  }
}
