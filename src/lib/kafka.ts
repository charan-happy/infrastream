import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';

const TOPIC = 'devops-events';

let kafka: Kafka | null = null;
let producer: Producer | null = null;

function getKafka(): Kafka | null {
  if (!process.env.KAFKA_BROKER) return null;
  if (!kafka) {
    kafka = new Kafka({
      clientId: 'infrastream',
      brokers: [process.env.KAFKA_BROKER],
      ssl: true,
      sasl: {
        mechanism: 'plain',
        username: process.env.KAFKA_USERNAME || '',
        password: process.env.KAFKA_PASSWORD || '',
      },
      logLevel: logLevel.WARN,
    });
  }
  return kafka;
}

export async function getProducer(): Promise<Producer | null> {
  const k = getKafka();
  if (!k) return null;
  if (!producer) {
    producer = k.producer();
    await producer.connect();
  }
  return producer;
}

export async function createConsumer(groupId: string): Promise<Consumer | null> {
  const k = getKafka();
  if (!k) return null;
  const consumer = k.consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
  return consumer;
}

export async function produceEvent(event: Record<string, unknown>): Promise<boolean> {
  const p = await getProducer();
  if (!p) return false;
  await p.send({
    topic: TOPIC,
    messages: [{ key: String(event.id || Date.now()), value: JSON.stringify(event) }],
  });
  return true;
}

export { TOPIC };
