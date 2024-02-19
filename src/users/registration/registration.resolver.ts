import { ValidationPipe } from "@nestjs/common";
import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { Public } from "../auth/decorators/public.decorator";
import { SignupInput } from "./dto/signup.input";
import { SignupResponse } from "./dto/signup.response";
import { ValidateCellphoneInput } from "./dto/validate-cellphone.input";
import { ValidateCellphoneResponse } from "./dto/validate-cellphone.response";
import { ValidateOtpInput } from "./dto/validate-otp.input";
import { ValidateOtpResponse } from "./dto/validate-otp.response";
import { RegistrationService } from "./registration.service";
@Resolver()
export class RegistrationResolver {
  constructor(private readonly registrationService: RegistrationService) {}

  @Mutation(() => ValidateCellphoneResponse)
  @Public()
  validateCellphone(
    @Args("ValidateCellphoneInput", new ValidationPipe({ transform: true }))
    validateCellphoneInput: ValidateCellphoneInput,
    @Context() context,
  ) {
    return this.registrationService.validateCellphone(
      validateCellphoneInput,
      context.req.ip,
    );
  }

  @Mutation(() => ValidateOtpResponse)
  @Public()
  validateOtp(
    @Args("ValidateOtpInput") validateOtpInput: ValidateOtpInput,
    @Context() context,
  ) {
    return this.registrationService.validateOtp(
      validateOtpInput,
      context.req.ip,
    );
  }

  @Mutation(() => SignupResponse)
  @Public()
  signup(@Args("SignupInput") signupInput: SignupInput, @Context() context) {
    return this.registrationService.signup(signupInput, context.req.ip);
  }
}
