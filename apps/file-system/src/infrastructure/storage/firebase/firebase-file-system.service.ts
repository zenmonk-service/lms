import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { StorageService } from '../storage-service.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseFileSystemService implements StorageService {
  storageBucket: string;

  constructor(private configService: ConfigService) {
    this.storageBucket = this.configService.get<string>('STORAGE_BUCKET');
  }

  async uploadFile(
    filePath: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const bucket = admin
      .storage()
      .bucket(this.storageBucket);
    const fileName = `${Date.now()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    return new Promise((resolve, reject) => {
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      stream.on('error', (err) => {
        reject({ success: false, error: err.message });
      });

      stream.on('finish', async () => {
        try {
          await fileUpload.makePublic();
          const publicUrl = `${process.env.PUBLIC_URL}${bucket.name}/o/${fileUpload.name}?alt=media&&timestamp=${Date.now()}`;
          resolve(publicUrl);
        } catch (err) {
          throw err;
        }
      });

      stream.end(file.buffer);
    });
  }

  async deleteFile(fileURL: string): Promise<void> {
    try {
      const bucket = admin
        .storage()
        .bucket(this.storageBucket);
      const fileName = fileURL.split('/').pop()!.split('?')[0];
      const file = bucket.file(fileName);
      await file.delete();
    } catch (err) {
      throw err;
    }
  }
}
