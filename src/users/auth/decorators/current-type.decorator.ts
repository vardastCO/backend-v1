import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserType } from '../enums/type-user.enum';
export const IsRealUserType = createParamDecorator(
  (data: unknown, context: ExecutionContext): boolean => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized');
    }
    const token = authHeader.slice(7);
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new UnauthorizedException('Invalid token format');
      }
      const decodedPayload = atob(parts[1]); 
      const payload = JSON.parse(decodedPayload);
      return payload.type === UserType.REAL;
    } catch (error) {
      throw new UnauthorizedException('Invalid token or unauthorized access');
    }
  },
);
