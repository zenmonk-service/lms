import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DataSource } from 'typeorm';
import type { DeepPartial } from 'typeorm';
import type { Request } from 'express';
import { Action } from '../../../domain/action.entity';
import { BaseRepository } from './base-repository';

@Injectable({ scope: Scope.REQUEST })
export class ActionRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  save(actions: DeepPartial<Action>[]) {
    return this.getRepository(Action).save(actions);
  }
}