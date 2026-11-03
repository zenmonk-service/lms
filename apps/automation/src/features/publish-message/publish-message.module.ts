import { Module } from "@nestjs/common";
import { PublishOutboxMessagesCommand } from "./publish-message.command";
import { PublishMessageService } from "./publish-message.service";
import { KafkaConnection } from "../../infrastructure/kafka/kafka-connection";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OutboxMessage } from "../../domain/outbox-message.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ OutboxMessage])],
    providers: [PublishOutboxMessagesCommand, PublishMessageService, KafkaConnection]
})
export class PublishMessageModule {}