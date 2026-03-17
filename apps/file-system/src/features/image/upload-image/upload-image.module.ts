import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadImageController } from './upload-image.controller';
import { UploadImageHandler } from './upload-image.service';
import { StorageModule } from 'src/infrastructure/storage/storage.module';

@Module({
  imports: [
    MulterModule.register({}),
    StorageModule
  ],
  controllers: [UploadImageController],
  providers: [UploadImageHandler],
})
export class UploadImageModule {}
