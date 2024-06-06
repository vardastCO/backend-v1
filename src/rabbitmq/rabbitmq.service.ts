// rabbitmq.service.ts
import { Injectable } from '@nestjs/common';
import { connect } from 'amqplib';

@Injectable()
export class RabbitMQService {
  private readonly rabbitMQUrl = 'amqp://rabbitmq:5672';
  private readonly queueName = 'chat_events';

  async checkConnection(): Promise<void> {
    const connection = await connect(this.rabbitMQUrl);
    await connection.close();
  }

  async sendMessageWithTopic(exchange: string, routingKey: string, message: string): Promise<void> {
    const connection = await connect(this.rabbitMQUrl);
    const channel = await connection.createChannel();

    await channel.assertExchange(exchange, 'topic', { durable: true });

    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify({ message })));

    await channel.close();
    await connection.close();
  }

  async subscribeToMessages(callback: (data: any) => void): Promise<void> {
    const connection = await connect(this.rabbitMQUrl);
    const channel = await connection.createChannel();

    await channel.assertQueue(this.queueName, { durable: true });
    channel.consume(
      this.queueName,
      (msg) => {
        if (msg !== null) {
          const data = JSON.parse(msg.content.toString());
          callback(data);
        }
      },
      { noAck: true }
    );

    // Note: This is a simple example, in a real application you might want to handle errors and close connections properly.
  }
}
