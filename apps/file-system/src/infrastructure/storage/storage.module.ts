import { Module, Provider } from '@nestjs/common';
import { FirebaseFileSystemService } from './firebase/firebase-file-system.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalFileSystemHandler } from './local-file-system/local-file-system.service';

const StorageProvider: Provider = {
  provide: 'StorageService',
  useFactory: (
    configService: ConfigService,
  ) => {
    const storageType = configService.get<string>('STORAGE_TYPE');

    if (storageType === 'local') {
      return new LocalFileSystemHandler(configService);
    } else if (storageType === 'gcs') {
      return new FirebaseFileSystemService(configService);
    } else {
      throw new Error('Invalid storage type');
    }
  },
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule],
  providers: [StorageProvider],
  exports: ['StorageService'],
})
export class StorageModule {}
