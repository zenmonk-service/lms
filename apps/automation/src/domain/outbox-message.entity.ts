import { Column, Entity, Generated, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { AvailableAction } from "./available-action.entity";
import { Zap } from "./zap.entity";
import { ZapRun } from "./zap-run.entity";

@Entity('outbox-message')
export class OutboxMessage extends BaseEntity {
    @Column({ type: 'int', nullable: false })
  zap_run_id: number;

  @ManyToOne(()=> ZapRun, zap=> zap.outbox_messages)
  @JoinColumn({name: 'zap_run_id'})
  zap_run: ZapRun
}