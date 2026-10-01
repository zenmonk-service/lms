import { Inject, Injectable, Scope } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from './base-repository';
import { Zap } from '../../../domain/zap.entity';
import type { Request } from 'express';
import { OutboxMessage } from '../../../domain/outbox-message.entity';
import type { DeepPartial } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class OutboxMessageRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  save(outboxMessage: DeepPartial<OutboxMessage>) {
    return this.getRepository(OutboxMessage).save(outboxMessage);
  }
}