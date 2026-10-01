import { Inject, Injectable, Scope } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from './base-repository';
import type { Request } from 'express';
import { ZapRun } from '../../../domain/zap-run.entity';

@Injectable({ scope: Scope.REQUEST })
export class ZapRunRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  createZapRun(zap_id: number, meta_data: Record<string, unknown>) {
    return this.getRepository(ZapRun).save({ zap_id, meta_data });
  }
}