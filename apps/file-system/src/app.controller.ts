import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'index.html'));
  }

  @Get('api')
  getApi(): string {
    return this.appService.getHello();
  }

  @Get('test-image')
  testImage(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'test-image.html'));
  }

  @Get('multi-upload')
  multiUpload(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'multi-upload.html'));
  }
}
