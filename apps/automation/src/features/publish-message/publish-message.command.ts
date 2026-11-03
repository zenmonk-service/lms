import { Injectable } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { KafkaConnection } from '../../infrastructure/kafka/kafka-connection';
import { PublishMessageService } from './publish-message.service';

@Injectable()
@Command({
  name: 'publish-messages',
  description: 'Publishes pending outbox messages to Kafka',
})
export class PublishOutboxMessagesCommand extends CommandRunner {
  constructor(
    private readonly outboxMessageService: PublishMessageService,
    private readonly kafka: KafkaConnection,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.runningOnLoop();
  }


  private async runningOnLoop(): Promise<void> {
    try {
      await this.kafka.connect();

      while (true) {
        const messages = await this.outboxMessageService.getMessages();

        if (messages.length === 0) {
          console.log('No pending messages. Checking again in 5 seconds...');
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }

        console.log(`Found ${messages.length} pending messages`);

        for (const message of messages) {
          await this.kafka.publishMessage(
            JSON.stringify(message.zap_run.meta_data),
          );

          await this.outboxMessageService.markAsCompleted(message.id);
        }
      }
    } catch (error) {
      console.error('Failed to publish outbox messages:', error);
      process.exitCode = 1;
    } finally {
      await this.kafka.close();
    }
  }

}
