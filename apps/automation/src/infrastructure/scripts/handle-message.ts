import { KafkaConnection } from '../kafka/kafka-connection';

async function handleMessages() {
  const kafka = new KafkaConnection();

  try {
    await kafka.connect();
  } catch (error) {
    console.error('Kafka consumer failed to connect:', error);
    process.exitCode = 1;
    return;
  }

  let closing = false;
  const shutdown = async () => {
    if (closing) return;
    closing = true;
    console.log('\nStopping Kafka consumer...');
    try {
      await kafka.close();
    } catch (error) {
      console.error('Failed to close Kafka connections:', error);
      process.exitCode = 1;
    }
  };

  process.once('SIGINT', () => void shutdown());
  process.once('SIGTERM', () => void shutdown());

  try {
    await kafka.consumeMessage((message) => {
      console.log(`Received message: ${message}`);
    });
  } catch (error) {
    console.error('Kafka consumer failed to start:', error);
    process.exitCode = 1;
    await shutdown();
  }
}

void handleMessages();
