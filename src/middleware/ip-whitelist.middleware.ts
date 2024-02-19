// ip-whitelist.middleware.ts

import { NextFunction, Request, Response } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class IpWhitelistMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) { 
    // res.setHeader('Content-Encoding', 'gzip');
    next();
    // let clientIP: string | undefined;
    // if (req.headers['x-forwarded-for']) {
    //   const forwardedForHeader = req.headers['x-forwarded-for'];
    //   if (Array.isArray(forwardedForHeader)) {
    //     clientIP = forwardedForHeader[0].trim();
    //   } else {
    //     clientIP = forwardedForHeader.split(',')[0].trim();
    //   }
    // } else if (req.headers['x-real-ip']) {
    //   clientIP = (req.headers['x-real-ip'] as string).split(',')[0].trim();
    // } 

    // const allowedIPs: string[] = ['45.61.155.89', '79.175.131.31',
    //   '78.46.124.237', '128.140.109.3','217.170.251.55','37.221.47.197','38.54.13.15'
    // ]; 
    // console.log(clientIP)
    // if (clientIP && allowedIPs.includes(clientIP)) {
      // next();
    // } else {
    //   res.status(403).send('Forbidden - Access Denied');
    // }
  }
}
