import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { Public } from "../auth/decorators/public.decorator";
import { PasswordResetInput } from "./dto/password-reset.input";
import { PasswordResetResponse } from "./dto/password-reset.response";
import { PasswordResetService } from "./password-reset.service";
@Resolver()
export class PasswordResetResolver {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Mutation(() => PasswordResetResponse)
  @Public()
  passwordReset(
    @Args("SignupInput") passwordResetInput: PasswordResetInput,
    @Context() context,
  ) {
    return this.passwordResetService.passwordReset(
      passwordResetInput,
      context.req.ip,
    );
  }
}
