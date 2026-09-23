import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Trigger } from './trigger.entity';
import { Action } from './action.entity';
import { ZapRun } from './zap-run.entity';

@Entity('zap')
export class Zap extends BaseEntity {
  @Column({ type: 'int', nullable: false })
  trigger_id: number;

  @OneToOne(() => Trigger, (trigger) => trigger.zap)
  @JoinColumn({ name: 'trigger_id' })
  trigger: Trigger;

  @OneToMany(() => Action, (action) => action.zap)
  actions: Action[];

  @OneToMany(() => ZapRun, (zapRun) => zapRun.zap)
  zap_runs: ZapRun[];
}
