import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Zap } from "./zap.entity";
import { OutboxMessage } from "./outbox-message.entity";

@Entity('zap_run')
export class ZapRun extends BaseEntity {
  @Column({ type: 'int', nullable: false })
  zap_id: number;

  @ManyToOne(()=> Zap, zap=> zap.zap_runs)
  @JoinColumn({name: 'zap_id'})
  zap: Zap

  @OneToMany(()=> OutboxMessage, outbox_messgae=> outbox_messgae.zap_run)
  outbox_messages: OutboxMessage[]

}