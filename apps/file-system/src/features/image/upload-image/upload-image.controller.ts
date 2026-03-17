import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageHandler } from './upload-image.service';
import { Response } from 'express';

@Controller('images')
export class UploadImageController {
  constructor(private readonly uploadImageHandler: UploadImageHandler) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async handle(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {

    const result = await this.uploadImageHandler.handle(file);

    if (result.success) {
      return res.status(HttpStatus.CREATED).json(result);
    } else {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(result);
    }
  }
}
