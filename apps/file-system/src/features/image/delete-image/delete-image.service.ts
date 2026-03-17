import { Injectable, Inject } from '@nestjs/common';
import { StorageService } from 'src/infrastructure/storage/storage-service.interface';

export interface DeleteImageResponse {
  success: boolean;
  message?: string;
  error?: string;
}

@Injectable()
export class DeleteImageHandler {
  constructor(@Inject('StorageService') private storageHandler: StorageService) {}

  async handler(publicUrl: string): Promise<DeleteImageResponse> {
    try {
      await this.storageHandler.deleteFile(publicUrl);
      return {
        success: true,
        message: `File with URL ${publicUrl} deleted successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'An error occurred while deleting the file'
      };
    }
  }
}
