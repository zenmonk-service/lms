import { Column, Entity, Generated, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { AvailableAction } from "./available-action.entity";
import { Zap } from "./zap.entity";

@Entity('action')
export class Action extends BaseEntity {
  @Column({ type: 'int', nullable: false })
  available_action_id: number;

  @Column({type:'int', nullable: false})
  @Generated('increment')
  order:number;

    @Column({ type: 'int', nullable: false })
  zap_id: number;

  @OneToOne(()=> AvailableAction, available_action => available_action.action)
  @JoinColumn({name: 'available_action_id'})
  type: AvailableAction

  @ManyToOne(()=> Zap, zap=> zap.actions)
  @JoinColumn({name: 'zap_id'})
  zap: Zap
}