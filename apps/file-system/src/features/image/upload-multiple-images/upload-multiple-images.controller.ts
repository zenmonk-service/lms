import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadMultipleImagesHandler } from './upload-multiple-images.service';
import { Response } from 'express';

@Controller('images')
export class UploadMultipleImagesController {
  constructor(private readonly uploadMultipleImagesHandler: UploadMultipleImagesHandler) {}

  @Post('/multi')
  @UseInterceptors(FilesInterceptor('files', 10))
  async handle(@UploadedFiles() files: Express.Multer.File[], @Res() res: Response) {
    const result = await this.uploadMultipleImagesHandler.handle(files);

    if (result.success) {
      return res.status(HttpStatus.CREATED).json(result);
    } else {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(result);
    }
  }
}
