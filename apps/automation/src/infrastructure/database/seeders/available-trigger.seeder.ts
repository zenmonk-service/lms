import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { AvailableTrigger } from '../../../domain/available-trigger.entity';

@Injectable()
export class AvailableTriggerSeeder implements Seeder {
    constructor(
        @InjectRepository(AvailableTrigger)
        private readonly repository: Repository<AvailableTrigger>,
    ) { }

    async seed(): Promise<void> {
        const name = 'webhook';
        try {
            const exists = await this.repository.findOneBy({ name });

            if (!exists) {
                await this.repository.save(
                    this.repository.create({ name, uuid: randomUUID() }),
                );
            }
        } catch (error) {
            console.log(error)
        }

    }

    async drop(): Promise<void> {
        await this.repository.delete({ name: 'webhook' });
    }
}