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
  
    const token = authHeader.slice(7); // Extract token from Bearer prefix

    try {
     
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new UnauthorizedException('Invalid token format');
      }
      console.log('paret',parts)

      const decodedHeader = atob(parts[0]); // Decode header (optional)
      const decodedPayload = atob(parts[1]); // Decode payload
      console.log('decodedPayload',decodedPayload)
      // Parse the decoded payload into a JavaScript object (assuming it's JSON)
      const payload = JSON.parse(decodedPayload);

      console.log('payload',payload)
      return payload.type === UserType.REAL;
    } catch (error) {
      throw new UnauthorizedException('Invalid token or unauthorized access');
    }
  },
);
