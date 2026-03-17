import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const fs = require('fs');

  if (process.env.STORAGE_TYPE === 'local') {
    const localStoragePath = process.env.LOCAL_STORAGE_PATH || './uploads';
    const cleanPath = localStoragePath.replace(/\\/g, '/').replace(/^\.\//g, '');

    const uploadsDir = join(process.cwd(), cleanPath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    app.useStaticAssets(uploadsDir, {
      prefix: '/' + cleanPath
    });
  }

  const publicDir = join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  app.useStaticAssets(publicDir);
  app.setBaseViewsDir(publicDir);
  app.setViewEngine('html');

  app.enableCors({
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition'],
  });

  const port = process.env.APP_PORT || 8000;
  await app.listen(port);
  console.log(`File system server is running on: http://localhost:${port}`);
}
bootstrap();
