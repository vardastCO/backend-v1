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
      console.log('process.env.AUTH_JWT_ACCESS_SECRET',process.env.AUTH_JWT_ACCESS_SECRET)
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new UnauthorizedException('Invalid token format');
      }

      const decodedHeader = atob(parts[0]); // Decode header (optional)
      const decodedPayload = atob(parts[1]); // Decode payload

      // Parse the decoded payload into a JavaScript object (assuming it's JSON)
      const payload = JSON.parse(decodedPayload);

      // Return the decoded payload containing user information
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token or unauthorized access');
    }
  },
);
