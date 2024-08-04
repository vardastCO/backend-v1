import { ValidationPipe } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Public } from "../auth/decorators/public.decorator";
import { Permission } from "../authorization/permission.decorator";
import { CreateBlackListInput } from "./dto/create-blackList.input";
import { SignupInput } from "./dto/signup.input";
import { SignupResponse } from "./dto/signup.response";
import { UpdateBlackListInput } from "./dto/update-blackList.input";
import { ValidateCellphoneInput } from "./dto/validate-cellphone.input";
import { ValidateCellphoneResponse } from "./dto/validate-cellphone.response";
import { ValidateOtpInput } from "./dto/validate-otp.input";
import { ValidateOtpResponse } from "./dto/validate-otp.response";
import { Blacklist } from "./entities/blacklist.entity";
import { RegistrationService } from "./registration.service";
import { PaginationBlackListResponse } from "./dto/pagination-blackList.responde";
import { IndexBlackListInput } from "./dto/index-balckList.input";
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


  @Mutation(() => Blacklist)
  @Permission("gql.products.seller_representative.update")
  createBlackList(@Args("CreateBlackListInput") createBlackListInput: CreateBlackListInput) {
    return this.registrationService.createBlackList(createBlackListInput)
  }
  

  @Mutation(() => Boolean)
  @Permission("gql.products.seller_representative.update")
  removeBlackList(@Args("id") id: number) {
    return this.registrationService.removeBlack(id)
  }


  @Mutation(() => Blacklist)
  @Permission("gql.products.seller_representative.update")
  updateBlackList(
    @Args("updateBlackListInput") updateBlackListInput: UpdateBlackListInput
  ) {
    return this.registrationService.updateBlackList(updateBlackListInput.id, updateBlackListInput);
  }

  @Query(() => Blacklist)
  findOneBlackList(@Args("id") id: number) {
    return this.registrationService.findOneBlack(id);
  }

   
  @Permission("gql.products.seller_representative.update")
  @Query(() => PaginationBlackListResponse, { name: "blackLists" })
  findAll(
    @Args(
      "indexBlackListInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexBlackListInput?: IndexBlackListInput,
  ) {
    return this.registrationService.blackListPaginate(indexBlackListInput);
  }
}
