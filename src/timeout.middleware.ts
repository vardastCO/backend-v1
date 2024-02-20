// timeout.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { throwError, timer, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class TimeoutMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const timeout$ = timer(10000); // Set a timeout of 5 seconds

    // Use takeUntil to complete the observable after the timeout
    const source$ = new Observable(subscriber => {
      timeout$.subscribe(() => {
        subscriber.error(new Error('Request timeout'));
      });
    });

    source$.pipe(takeUntil(timeout$)).subscribe({
      error: (error) => {
        next(error);
      },
      complete: () => {
        next();
      },
    });
  }
}
