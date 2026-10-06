import { KafkaConnection } from '../kafka/kafka-connection';

async function publishMessages() {
      const kafka = new KafkaConnection();

  try {
    await kafka.connect();
  } catch (error) {
    console.error('Kafka consumer failed to connect:', error);
    process.exitCode = 1;
    return;
  }

  const messages = 
}