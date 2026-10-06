import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxMessage } from '../../domain/outbox-message.entity';
import { ZapRun } from '../../domain/zap-run.entity';
import { WeekhookController } from './weekhook.controller';
import { OutboxMessageService } from './weekhook.service';

@Module({
	imports: [TypeOrmModule.forFeature([ZapRun, OutboxMessage])],
	controllers: [WeekhookController],
	providers: [OutboxMessageService],
})
export class WeekhookModule {}