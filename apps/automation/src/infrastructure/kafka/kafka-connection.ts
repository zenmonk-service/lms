import { Kafka, type Consumer, type Producer } from 'kafkajs';
import { KafkaConfig } from './kafka-config';

export class KafkaConnection {
  config: KafkaConfig;
  private kafka: Kafka;
  private producer: Producer;
  private consumer?: Consumer;
  private producerConnected = false;

  constructor() {
    this.config = new KafkaConfig();
    this.kafka = new Kafka({
      clientId: this.config.clientId,
      brokers: this.config.brokers,
    });
    this.producer = this.kafka.producer();
    this.consumer = undefined;
  }

  async connect() {
    await this.producer.connect();
    this.producerConnected = true;
  }

  async publishMessage(message: string) {
    if (!this.producerConnected) {
      throw new Error('Kafka producer has not been connected');
    }

    await this.producer.send({
      topic: this.config.topic,
      messages: [{ value: message }],
    });
  }

  async consumeMessage(onMessage: (message: string) => void | Promise<void>) {
    if (this.consumer) {
      throw new Error('Kafka consumer is already running');
    }

    const consumer = this.kafka.consumer({ groupId: this.config.groupId });
    this.consumer = consumer;

    await consumer.connect();
    await consumer.subscribe({ topic: this.config.topic, fromBeginning: true });
    console.log(
      `Waiting for messages in Kafka topic "${this.config.topic}"...`,
    );

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) {
          return;
        }

        try {
          await onMessage(message.value.toString());
        } catch (error) {
          console.error('Failed to handle Kafka message:', error);
          throw error;
        }
      },
    });
  }

  async close() {
    const closeOperations: Promise<void>[] = [];
    if (this.consumer) {
      closeOperations.push(this.consumer.disconnect());
      this.consumer = undefined;
    }
    if (this.producerConnected) {
      closeOperations.push(this.producer.disconnect());
      this.producerConnected = false;
    }
    await Promise.all(closeOperations);
  }
}
