import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as compression from 'compression';

async function bootstrap() {
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
    }),
  );

  app.enableCors();
  app.use(
    compression()
  );
  await app.listen(3081);
}
bootstrap();
