import { Module } from '@nestjs/common';
import { ActionRepository } from '../../infrastructure/database/repository/action.repository';
import { OutboxMessageRepository } from '../../infrastructure/database/repository/outbox-message.repository';
import { TriggerRepository } from '../../infrastructure/database/repository/trigger.repository';
import { ZapRepository } from '../../infrastructure/database/repository/zap.repository';
import { ZapRunRepository } from '../../infrastructure/database/repository/zap-run.repository';
import { TransactionInterceptor } from '../../infrastructure/http/interceptors/transaction.interceptor';
import { WeekhookController } from './weekhook.controller';
import { OutboxMessageService } from './weekhook.service';

@Module({
	controllers: [WeekhookController],
	providers: [
		OutboxMessageService,
		OutboxMessageRepository,
		ZapRunRepository,
		ZapRepository,
		TriggerRepository,
		ActionRepository,
		TransactionInterceptor,
	],
})
export class WeekhookModule {}