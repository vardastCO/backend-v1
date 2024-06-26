import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
// import { useContainer } from "class-validator";
import { AppModule } from "./app.module";
// import { IpWhitelistMiddleware } from "./middleware/ip-whitelist.middleware";
// import { ElasticsearchTransport } from 'winston-elasticsearch';
// import * as winston from 'winston';
// import 'winston-elasticsearch';
// import { initializeApm } from './initapm';
import * as compression from 'compression';
import {  NotFoundExceptionFilter } from "./notFoundExceptionFilter";
// import * as cluster from 'cluster';
// import * as os from 'os';

async function bootstrap() {
  // const logger = winston.createLogger({
  //   transports: [
  //     new winston.transports.Console(),
  //     new ElasticsearchTransport({
  //       level: 'silly', // Log all levels
  //       indexPrefix: 'vardast',
  //       clientOpts: { node: 'http://elasticsearch:9200' },
  //     }),
  //   ],
  // });
  const app = await NestFactory.create(AppModule, {
    cors: {
      // BUG: cors not working with options below
      // origin: "http://localhost:3000",
      // methods: ["POST"],
      // allowedHeaders: "Content-Type, Accept",
      // credentials: true,
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // forbidNonWhitelisted: true,
      // transform: true,
    }),
  );
  // app.use(new IpWhitelistMiddleware().use);
  // await initializeApm()

  app.enableCors();
  app.use(
    compression({
      level: 9,       // Maximum compression level
      memLevel: 9,    // Maximum memory usage for compression
    })
  );
  // app.use(new TimingMiddleware().use);
  // app.useLogger(logger);
  // try {
  app.useGlobalFilters(new NotFoundExceptionFilter());
  await app.listen(3080, '::');
  //   logger.info('Nest.js application started successfully.');
  // } catch (error) {
  //   logger.error(`Error starting Nest.js application: ${error.message}`);
  //   throw error;
  // }
}
bootstrap();
