import { Injectable } from '@nestjs/common';
import { Zap } from '../../domain/zap.entity';
import { ActionRepository } from '../../infrastructure/database/repository/action.repository';
import { TriggerRepository } from '../../infrastructure/database/repository/trigger.repository';
import { ZapRepository } from '../../infrastructure/database/repository/zap.repository';

interface CreateZapPayload {
  trigger: { available_trigger_id: number };
  actions: Array<{ available_action_id: number }>;
}

@Injectable()
export class ZapService {
  constructor(
    private zapRepository: ZapRepository,
    private triggerRepository: TriggerRepository,
    private actionRepository: ActionRepository,
  ) {}

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
    return this.zapRepository.findAll();
  }
}
