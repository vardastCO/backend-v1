import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { TypeOrmModule } from "@nestjs/typeorm";
import { I18nModule } from "nestjs-i18n";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BaseModule } from "./base/base.module";
import { cacheAsyncConfig } from "./config/cache.config";
import { graphqlAsyncConfig } from "./config/graphql.config";
import { i18nConfig } from "./config/i18n.config";
import { typeOrmAsyncConfig } from "./config/typeorm.config";
import { ProductsModule } from "./products/products.module";
import { UsersModule } from "./users/users.module";
import { ScheduleModule } from '@nestjs/schedule';
import { CronJobService } from "./cron-job.service";
import { ThrottlerModule } from '@nestjs/throttler';
import { KavenegarService } from "./base/kavenegar/kavenegar.service";
import { KavenegarModule } from "./base/kavenegar/kavenegar.module";
// import { RabbitMQModule } from "./rabitmq/rabbitmq.module";
// import { ElasticsearchModule } from '@nestjs/elasticsearch';
// import { ElasticsearchServices } from "./elastic/elastic-service";
// import { ElasticModule } from "./elastic/elastic.module";
// import { ClientsModule, Transport } from '@nestjs/microservices';
// import { RabbitMQProducerService } from "./rabitmq/rabbitmq-producer.service";
// import { RabbitMQConsumerService } from "./rabitmq/rabbitmq-consumer.service";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    KavenegarModule,
    I18nModule.forRoot(i18nConfig),
    CacheModule.registerAsync(cacheAsyncConfig),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    GraphQLModule.forRootAsync(graphqlAsyncConfig),
    BaseModule,
    UsersModule,
    ProductsModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 5,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100
      }
    ]),
    // RabbitMQModule,
    // ElasticsearchModule.register({
    //   node: 'http://elasticsearch:9200', // Elasticsearch server URL
    // }),

  ],
  controllers: [AppController],
  // providers: [AppService, ElasticsearchServices],
  providers: [AppService,CronJobService],
})
export class AppModule  {}
