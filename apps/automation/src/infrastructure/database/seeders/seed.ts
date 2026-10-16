import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailableAction } from '../../../domain/available-action.entity';
import { AvailableTrigger } from '../../../domain/available-trigger.entity';
import { connectionSource } from '../configuration';
import { AvailableActionSeeder } from './available-action.seeder';
import { AvailableTriggerSeeder } from './available-trigger.seeder';

@Module({
  imports: [
    TypeOrmModule.forRoot(connectionSource.options),
    TypeOrmModule.forFeature([AvailableTrigger, AvailableAction]),
  ],
  providers: [AvailableTriggerSeeder, AvailableActionSeeder],
})
class SeederModule {}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(SeederModule);

  try {
    const seeders = [
      app.get(AvailableTriggerSeeder),
      app.get(AvailableActionSeeder),
    ];

    if (process.argv.some((argument) => ['-r', '--refresh'].includes(argument))) {
      await Promise.all(seeders.map((seeder) => seeder.drop()));
    }

    for (const seeder of seeders) {
      await seeder.seed();
      console.log(`${seeder.constructor.name} completed`);
    }
  } finally {
    await app.close();
  }
}

void bootstrap().catch((error: unknown) => {
  console.error('Database seeding failed:', error);
  process.exitCode = 1;
});