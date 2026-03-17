import { ConfigService } from '@nestjs/config';
import * as fs from 'fs'
import { StorageService } from '../storage-service.interface';
import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class LocalFileSystemHandler implements StorageService {
    private readonly fs: typeof fs;
    private readonly basePath: string;

    constructor(
        private readonly configService: ConfigService
    ) {
        this.fs= fs,
        this.basePath = configService.get<string>('LOCAL_STORAGE_PATH') || './uploads';
    }

    async uploadFile(filePath: string, file: Express.Multer.File): Promise<string> {
        try {
            let uploadsDir = this.basePath;
            if (!this.basePath.startsWith('/')) {
                uploadsDir = join(process.cwd(), this.basePath);
            }

            if (!this.fs.existsSync(uploadsDir)) {
                await this.fs.promises.mkdir(uploadsDir, { recursive: true });
            }

            const fileExtension = filePath.split('.').pop() || 'jpg';
            const fileName = `${Date.now()}-${Math.floor(Math.random() * 10000)}.${fileExtension}`;
            const fullPath = join(uploadsDir, fileName);

            await this.fs.promises.writeFile(fullPath, file.buffer);

            const relativePath = join(this.basePath, fileName).replace(/\\/g, '/');
            const url = `${this.configService.get<string>('NEXT_PUBLIC_URL')}/${relativePath}`;

            return url;
        } catch (error) {
            throw error;
        }
    }

    async deleteFile(filePath: string): Promise<void> {
        try {
            let fileName: string | undefined;
            if (filePath.includes('http://') || filePath.includes('https://')) {
                const urlParts = new URL(filePath);
                const pathParts = urlParts.pathname.split('/');

                fileName = pathParts[pathParts.length - 1];

                if (fileName.includes('?')) {
                    fileName = fileName.split('?')[0];
                }
            } else {
                fileName = filePath.split('/').pop();
            }

            let uploadsDir = this.basePath;
            if (!this.basePath.startsWith('/')) {
                uploadsDir = join(process.cwd(), this.basePath);
            }

            const fullPath = join(uploadsDir, fileName);

            if (this.fs.existsSync(fullPath)) {
                await this.fs.promises.unlink(fullPath);
            } else {
                throw new Error(`File not found: ${fileName}`);
            }
        } catch (error) {
            throw error;
        }
    }
}