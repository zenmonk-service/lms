import { Injectable } from '@nestjs/common';
import { ZapRunRepository } from '../../infrastructure/database/repository/zap-run.repository';
import { OutboxMessageRepository } from '../../infrastructure/database/repository/outbox-message.repository';

@Injectable()
export class OutboxMessageService {
  constructor(
    private zapRunRepository: ZapRunRepository,
    private outboxMessageRepository: OutboxMessageRepository,
  ) {}

  async catchHook(
    zapId: number,
    payload: { meta_data: Record<string, unknown> },
  ) {
    const zapRun = await this.zapRunRepository.createZapRun(
      zapId,
      payload.meta_data,
    );

    const outboxMessage = await this.outboxMessageRepository.save({
      zap_run_id: zapRun.id,
    });

    return { zapRun, outboxMessage };
  }
}
