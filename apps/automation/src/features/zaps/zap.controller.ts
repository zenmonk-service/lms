import { Controller, Get } from '@nestjs/common';
import { ZapService } from './zap.service';

@Controller('zaps')
export class ZapController {
  constructor(private readonly zapService: ZapService) {}

}