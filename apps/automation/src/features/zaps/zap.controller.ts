import { Body, Controller, Get, Post } from '@nestjs/common';
import { ZapService } from './zap.service';

@Controller('zaps')
export class ZapController {
  constructor(private readonly zapService: ZapService) { }

  @Post()
  async createZap(@Body() payload: { trigger: { available_trigger_id: number }; actions: Array<{ available_action_id: number }> }) {
    return this.zapService.createZap(payload);
  }

  @Get()
  async listZap() {
    return this.zapService.listZap();
  }
}