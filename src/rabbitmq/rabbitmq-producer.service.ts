// rabbitmq-producer.service.ts

import { Injectable } from "@nestjs/common";
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";

@Injectable()
export class RabbitMQProducerService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ["amqp://localhost:5672"], // RabbitMQ server URL
        queue: "vardast",
      },
    });
  }

  async sendMessage(message: string): Promise<void> {
    await this.client.emit("vardast", message).toPromise();
  }
}
