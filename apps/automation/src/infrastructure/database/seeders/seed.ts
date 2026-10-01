import { TypeOrmModule } from '@nestjs/typeorm';
import { seeder } from 'nestjs-seeder';
import { AvailableAction } from '../../../domain/available-action.entity';
import { AvailableTrigger } from '../../../domain/available-trigger.entity';
import { connectionSource } from '../configuration';
import { AvailableActionSeeder } from './available-action.seeder';
import { AvailableTriggerSeeder } from './available-trigger.seeder';

seeder({
  imports: [
    TypeOrmModule.forRoot(connectionSource.options),
    TypeOrmModule.forFeature([AvailableTrigger, AvailableAction]),
  ],
}).run([AvailableTriggerSeeder, AvailableActionSeeder]);