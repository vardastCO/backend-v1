// src/rabbitmq/rabbitmq-producer.service.ts
import { Injectable } from '@nestjs/common';
import { connect } from 'amqplib';

@Injectable()
export class RabbitMQProducerService {
  private channel;

  constructor() {
    this.init();
  }

  async init() {
    const connection = await connect('amqp://localhost');
    this.channel = await connection.createChannel();
    await this.channel.assertQueue('example_queue', { durable: false });
  }

  async sendMessage(message: string) {
    this.channel.sendToQueue('example_queue', Buffer.from(message));
  }
}
