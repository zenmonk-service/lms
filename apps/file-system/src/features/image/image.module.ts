import { Module } from '@nestjs/common';
import { UploadImageModule } from './upload-image/upload-image.module';
import { DeleteImageModule } from './delete-image/delete-image.module';
import { UploadMultipleImagesModule } from './upload-multiple-images/upload-multiple-images.module';

@Module({
  imports: [
    UploadImageModule,
    DeleteImageModule,
    UploadMultipleImagesModule
  ],
})
export class ImageModule {}
