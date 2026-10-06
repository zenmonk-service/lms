import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZapRun } from '../../domain/zap-run.entity';
import { OutboxMessage } from '../../domain/outbox-message.entity';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class OutboxMessageService {
  constructor(
    @InjectRepository(ZapRun)
    private readonly zapRunRepository: Repository<ZapRun>,
    @InjectRepository(OutboxMessage)
    private readonly outboxMessageRepository: Repository<OutboxMessage>,
  ) {}

  @Transactional()
  async catchHook(
    zapId: number,
    payload: { meta_data: Record<string, unknown> },
  ) {
    const zapRun = await this.zapRunRepository.save({
      zap_id: zapId,
      meta_data: payload.meta_data,
    });

    const outboxMessage = await this.outboxMessageRepository.save({
      zap_run_id: zapRun.id,
    });

    return { zapRun, outboxMessage };
  }
}
