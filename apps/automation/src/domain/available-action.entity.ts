import { Column, Entity, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Action } from "./action.entity";

@Entity('available_action')
export class AvailableAction extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @OneToOne(()=> Action, action=> action.type)
  action: Action

}