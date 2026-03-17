import { Controller, Res, Delete, Body, HttpStatus } from '@nestjs/common';
import { DeleteImageHandler } from './delete-image.service';
import { Response } from 'express';

@Controller('images')
export class DeleteImageController {
  constructor(private readonly deleteImageHandler: DeleteImageHandler) {}

  @Delete()
  async handle(
    @Res() res: Response,
    @Body() { publicUrl }: { publicUrl: string },
  ) {
    const result = await this.deleteImageHandler.handler(publicUrl);

    if (result.success) {
      return res.status(HttpStatus.OK).json(result);
    } else {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(result);
    }
  }
}
