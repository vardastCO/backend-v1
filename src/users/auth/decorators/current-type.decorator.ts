import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UnauthorizedException } from '@nestjs/common';
import { verify } from "argon2";
export const CurrentType = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized');
    }
  
    const token = authHeader.slice(7); // Extract token from Bearer prefix
    console.log('token',token)
    try {

      const decoded = verify(token, process.env.AUTH_JWT_ACCESS_SECRET);
      console.log('dec',decoded)

      return decoded; // Return user type from decoded payload
    } catch (error) {
      throw new UnauthorizedException('Invalid token or unauthorized access');
    }
  },
);
