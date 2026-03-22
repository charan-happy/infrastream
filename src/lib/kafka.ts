import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';
import * as fs from 'fs';
import * as path from 'path';

const TOPIC = 'devops-events';

let kafka: Kafka | null = null;
let producer: Producer | null = null;

function readCert(filename: string): string | undefined {
  const certPath = process.env[`KAFKA_${filename.toUpperCase()}_PATH`]
    || path.join(process.cwd(), 'certificates', filename);
  try {
    return fs.readFileSync(certPath, 'utf-8');
  } catch {
    return undefined;
  }
}

function getKafka(): Kafka | null {
  if (!process.env.KAFKA_BROKER) return null;
  if (!kafka) {
    const ca = readCert('kafka-ca.pem');
    const cert = readCert('kafka-access-certificate.pem');
    const key = readCert('kafka-access.pem');

    const useCerts = ca && cert && key;

    kafka = new Kafka({
      clientId: 'infrastream',
      brokers: [process.env.KAFKA_BROKER],
      ssl: useCerts
        ? { rejectUnauthorized: true, ca: [ca], cert, key }
        : { rejectUnauthorized: false },
      ...((!useCerts && process.env.KAFKA_USERNAME) ? {
        sasl: {
          mechanism: 'plain' as const,
          username: process.env.KAFKA_USERNAME,
          password: process.env.KAFKA_PASSWORD || '',
        },
      } : {}),
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
