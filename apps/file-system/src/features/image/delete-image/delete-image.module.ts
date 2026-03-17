import { Module } from '@nestjs/common';
import { DeleteImageController } from './delete-image.controller';
import { DeleteImageHandler } from './delete-image.service';
import { StorageModule } from 'src/infrastructure/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [DeleteImageController],
  providers: [DeleteImageHandler],
})
export class DeleteImageModule {}
