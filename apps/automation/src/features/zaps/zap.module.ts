import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Action } from '../../domain/action.entity';
import { Trigger } from '../../domain/trigger.entity';
import { Zap } from '../../domain/zap.entity';
import { ZapController } from './zap.controller';
import { ZapService } from './zap.service';

@Module({
  imports: [TypeOrmModule.forFeature([Zap, Trigger, Action])],
  controllers: [ZapController],
  providers: [ZapService],
})
export class ZapModule {}