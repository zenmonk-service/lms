import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadMultipleImagesController } from './upload-multiple-images.controller';
import { UploadMultipleImagesHandler } from './upload-multiple-images.service';
import { StorageModule } from 'src/infrastructure/storage/storage.module';

@Module({
  imports: [
    MulterModule.register({}),
    StorageModule
  ],
  controllers: [UploadMultipleImagesController],
  providers: [UploadMultipleImagesHandler],
})
export class UploadMultipleImagesModule {}
