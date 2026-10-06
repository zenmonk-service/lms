import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zap } from '../../domain/zap.entity';
import { Action } from '../../domain/action.entity';
import { Trigger } from '../../domain/trigger.entity';
import { Transactional } from 'typeorm-transactional';

interface CreateZapPayload {
  trigger: { available_trigger_id: number };
  actions: Array<{ available_action_id: number }>;
}

@Injectable()
export class ZapService {
  constructor(
    @InjectRepository(Zap)
    private readonly zapRepository: Repository<Zap>,
    @InjectRepository(Trigger)
    private readonly triggerRepository: Repository<Trigger>,
    @InjectRepository(Action)
    private readonly actionRepository: Repository<Action>,
  ) {}

  @Transactional()
  async createZap(payload: CreateZapPayload): Promise<Zap> {
    const { actions, trigger } = payload;

    const triggerResponse = await this.triggerRepository.save(trigger);
    const zapResponse = await this.zapRepository.save({
      trigger_id: triggerResponse.id,
    });

    const actionPayload = actions.map((action, idx) => {
      return {
        available_action_id: action.available_action_id,
        order: idx,
        zap_id: zapResponse.id,
      };
    });

    await this.actionRepository.save(actionPayload);
    return zapResponse;
  }

  async listZap(): Promise<Zap[]> {
    return this.zapRepository.find();
  }
}
