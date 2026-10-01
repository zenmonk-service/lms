import { Inject, Injectable, Scope } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from './base-repository';
import { Zap } from '../../../domain/zap.entity';
import type { Request } from 'express';
import type { DeepPartial } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class ZapRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  save(zap: DeepPartial<Zap>) {
    return this.getRepository(Zap).save(zap);
  }

  findAll() {
    return this.getRepository(Zap).find();
  }
}