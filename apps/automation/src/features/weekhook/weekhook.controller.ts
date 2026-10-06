import {
	Body,
	Controller,
	Param,
	ParseIntPipe,
	Post,
} from '@nestjs/common';
import { OutboxMessageService } from './weekhook.service';

interface WebhookPayload {
	meta_data: Record<string, unknown>;
}

@Controller('hooks')
export class WeekhookController {
	constructor(private readonly outboxMessageService: OutboxMessageService) {}

	@Post(':zap_id')
	catchHook(
		@Param('zap_id', ParseIntPipe) zapId: number,
		@Body() payload: WebhookPayload,
	) {
		return this.outboxMessageService.catchHook(zapId, payload);
	}
}