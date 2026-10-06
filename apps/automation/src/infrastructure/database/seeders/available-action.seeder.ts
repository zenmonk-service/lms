import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Seeder } from 'nestjs-seeder';
import { In, Repository } from 'typeorm';
import { AvailableAction } from '../../../domain/available-action.entity';

@Injectable()
export class AvailableActionSeeder implements Seeder {
	private readonly names = ['mail', 'google excel'];

	constructor(
		@InjectRepository(AvailableAction)
		private readonly repository: Repository<AvailableAction>,
	) { }

	async seed(): Promise<void> {
		console.log(this.names)
		try {
			for (const name of this.names) {
				const exists = await this.repository.findOneBy({ name });
				if (!exists) {
					await this.repository.save(
						this.repository.create({ name, uuid: randomUUID() }),
					);
				}
			}
		} catch (error) {
			console.log(error)
		}

	}

	async drop(): Promise<void> {
		await this.repository.delete({ name: In(this.names) });
	}
}
