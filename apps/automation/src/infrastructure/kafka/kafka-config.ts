export class KafkaConfig {
  brokers: string[];
  clientId: string;
  topic: string;
  groupId: string;

  constructor() {
    const brokers = process.env.KAFKA_BROKERS ?? 'localhost:9092';
    this.brokers = brokers
      .split(',')
      .map((broker) => broker.trim())
      .filter(Boolean);
    if (this.brokers.length === 0) {
      throw new Error('KAFKA_BROKERS must contain at least one broker');
    }

    this.clientId = process.env.KAFKA_CLIENT_ID ?? 'lms-automation';
    this.topic = process.env.KAFKA_TOPIC ?? 'zapier-events';
    this.groupId = process.env.KAFKA_GROUP_ID ?? 'automation-consumer';
  }
}
