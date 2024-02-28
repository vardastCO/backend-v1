import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as compression from 'compression';
import { TimingMiddleware } from "./timeout.middleware";
import * as cluster from 'cluster';
import * as os from 'os';

async function bootstrap() {
  if (cluster.isMaster) {
    // If the current process is the master, fork workers
    const numCPUs = os.cpus().length;

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`);
      // You can restart the worker here if needed
    });
  } else {
    // If the current process is a worker, create the NestJS app
    const app = await NestFactory.create(AppModule, {
      cors: {},
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    app.enableCors();
    app.use(compression());
    app.use(new TimingMiddleware().use);

    await app.listen(3080, '::');

    console.log(`Worker ${process.pid} started`);
  }
}

bootstrap();
