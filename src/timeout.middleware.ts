// timeout.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { throwError, timer, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class TimeoutMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const timeoutDuration = 10000; // Set a timeout of 10 seconds

    // Using throwError with delay to create a delayed error observable
    const timeout$ = throwError(new Error('Request timeout')).pipe(
      takeUntil(timer(timeoutDuration))
    );

    timeout$.subscribe({
      error: (error) => next(error),
      complete: () => next(),
    });
  }
}
