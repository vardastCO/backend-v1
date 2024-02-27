// timing.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TimingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on('finish', () => {
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;

      console.log(`Request duration: ${elapsedTime} ms`);
    });

    next();
  }
}
