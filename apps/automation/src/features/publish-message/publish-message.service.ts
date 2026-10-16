import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OutboxMessage } from "../../domain/outbox-message.entity";
import { OutboxMessageStatus } from "../../domain/enum/outbox-message.status";

@Injectable()
export class PublishMessageService {
  constructor(
    @InjectRepository(OutboxMessage)
    private readonly outboxMessageRepository: Repository<OutboxMessage>,
  ) {}

  async getMessages(limit = 5): Promise<OutboxMessage[]> {
    return this.outboxMessageRepository.find({
      where: { status: OutboxMessageStatus.pending },
      take: limit,
      order: { created_at: "ASC" },
      relations: { zap_run: true },
    });
  }

  async markAsCompleted(id: number): Promise<void> {
    const result = await this.outboxMessageRepository.update(
      { id, status: OutboxMessageStatus.pending },
      { status: OutboxMessageStatus.completed },
    );

    if (result.affected !== 1) {
      throw new Error(`Outbox message ${id} could not be marked completed`);
    }
  }
}