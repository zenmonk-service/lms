import { Column, Entity, Generated, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { AvailableAction } from "./available-action.entity";
import { Zap } from "./zap.entity";

@Entity('outbox-message')
export class OutboxMessage extends BaseEntity {
    @Column({ type: 'int', nullable: false })
  zap_run_id: number;

  @OneToOne(()=> AvailableAction, available_action => available_action.action)
  @JoinColumn({name: 'available_action_id'})
  type: AvailableAction

  @ManyToOne(()=> Zap, zap=> zap.actions)
  @JoinColumn({name: 'zap_id'})
  zap: Zap
}