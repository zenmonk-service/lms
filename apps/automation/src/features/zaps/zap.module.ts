import { Module } from '@nestjs/common';
import { ZapController } from './zap.controller';
import { ZapService } from './zap.service';
import { TransactionInterceptor } from '../../infrastructure/http/interceptors/transaction.interceptor';
import { ZapRepository } from '../../infrastructure/database/repository/zap.repository';
import { TriggerRepository } from '../../infrastructure/database/repository/trigger.repository';
import { ActionRepository } from '../../infrastructure/database/repository/action.repository';

@Module({
  controllers: [ZapController],
  providers: [
    ZapService,
    ZapRepository,
    TriggerRepository,
    ActionRepository,
    TransactionInterceptor,
  ],
})
export class ZapModule {}