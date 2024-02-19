// src/rabbitmq/rabbitmq-config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQConfigService {
  constructor(private configService: ConfigService) {}

  get rabbitmqUrl(): string {
    return this.configService.get<string>('rabbitmq.url');
  }

  get queue(): string {
    return this.configService.get<string>('rabbitmq.queue');
  }
}
