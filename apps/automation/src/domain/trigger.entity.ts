import { Column, Entity, Generated, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { AvailableTrigger } from "./available-trigger.entity";
import { Zap } from "./zap.entity";

@Entity('trigger')
export class Trigger extends BaseEntity {
  @Column({ type: 'int', nullable: false })
  available_trigger_id: number;

  @Column({ type: 'jsonb', nullable: false })
  meta_data: Record<string, any>;

  @OneToOne(() => AvailableTrigger, available_trigger => available_trigger.trigger)
  @JoinColumn({ name: 'available_trigger_id' })
  type: AvailableTrigger

  @OneToOne(() => Zap, zap => zap.trigger)
  zap: Zap
}