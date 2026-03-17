import { ConfigModule, ConfigService } from '@nestjs/config';
import { ImageModule } from './features/image/image.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ImageModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'FirebaseService',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const storageType = configService.get<string>('STORAGE_TYPE');

        if (storageType !== 'gcs') {
          return null; // ✅ Do not initialize Firebase
        }

        const credentialsPath = configService.get<string>('GCS_CREDENTIALS_PATH');
        const bucket = configService.get<string>('STORAGE_BUCKET');

        if (!credentialsPath || !bucket) {
          throw new Error(
            'GCS_CREDENTIALS_PATH or STORAGE_BUCKET is missing for GCS storage',
          );
        }

        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(credentialsPath),
            storageBucket: bucket,
          });
        }

        return admin;
      },
    },
  ],
})
export class AppModule {}
