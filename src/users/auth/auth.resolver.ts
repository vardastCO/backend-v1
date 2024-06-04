import { UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { User } from "../user/entities/user.entity";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { Public } from "./decorators/public.decorator";
import { LoginInput } from "./dto/login.input";
import { LoginOTPInput } from "./dto/login-otp.input";
import { LoginResponse } from "./dto/login.response";
import { LogoutResponse } from "./dto/logout.response";
import { RefreshInput } from "./dto/refresh.input";
import { RefreshResponse } from "./dto/refresh.response";
import { GqlAuthGuard } from "./guards/gql-auth.guard";
import { CurrentType } from "./decorators/current-type.decorator";
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponse)
  @Public()
  @UseGuards(GqlAuthGuard)
  login(@Args("loginInput") loginInput: LoginInput, @Context() context) {
    return this.authService.login(
      context.user,
      context.req.ip,
      this._getAgentFromHeader(context),
    );
  }

  
  @Mutation(() => LoginResponse)
  @Public()
  loginWithOtp(@Args("LoginOTPInput") LoginOTPInput: LoginOTPInput, @Context() context) {
    return this.authService.loginOTP(
      LoginOTPInput,
      context.req.ip,
      this._getAgentFromHeader(context),
    );
  }

  @Mutation(() => RefreshResponse)
  @Public()
  refresh(
    @Args("refreshInput") refreshInput: RefreshInput,
    @Context() context,
    @CurrentUser() user: User,
  ) {
    return this.authService.refresh(refreshInput, user);
  }

  @Query(() => LogoutResponse)
  logout(
    // @Args("logoutInput") logoutInput: LogoutInput,
    @CurrentUser() user: User,
    @Context() context,
  ) {
    return this.authService.logout(
      user,
      context.req.ip,
      this._getAccessTokenFromHeader(context),
    );
  }

  @Query(() => User)
  whoAmI(@CurrentUser() user: User, @CurrentType() type: string) {
    console.log('y',type)
    return this.authService.whoAmI(user);
  }

  private _getAccessTokenFromHeader(context): string {
    return context.req.header("authorization").replace("Bearer ", "");
  }

  private _getAgentFromHeader(context): string {
    return context.req.header("user-agent", "Unknown");
  }
}
