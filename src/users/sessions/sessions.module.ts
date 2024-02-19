import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsResolver } from './sessions.resolver';

@Module({
  providers: [SessionsResolver, SessionsService]
})
export class SessionsModule {}
