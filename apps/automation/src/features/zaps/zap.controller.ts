import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { ZapService } from './zap.service';
import { TransactionInterceptor } from '../../infrastructure/http/interceptors/transaction.interceptor';

@Controller('zaps')
@UseInterceptors(TransactionInterceptor)
export class ZapController {
  constructor(private readonly zapService: ZapService) {}

  @Post()
  async createZap(@Body() payload: { trigger: { available_trigger_id: number }; actions: Array<{ available_action_id: number }> }) {
    return this.zapService.createZap(payload);
  }

  @Get()
  async listZap() {
    return this.zapService.listZap();
  }
}