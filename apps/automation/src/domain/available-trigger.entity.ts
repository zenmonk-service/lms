import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Trigger } from './trigger.entity';

@Entity('zap')
export class AvailableTrigger extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @OneToOne(() => Trigger, (trigger) => trigger.type)
  trigger: Trigger;
}
