import { Module } from "@nestjs/common";
import { AddressModule } from "./address/address.module";
import { AuthModule } from "./auth/auth.module";
import { AuthorizationModule } from "./authorization/authorization.module";
import { ContactInfoModule } from "./contact-info/contact-info.module";
import { PasswordResetModule } from "./password-reset/password-reset.module";
import { RegistrationModule } from "./registration/registration.module";
import { SessionsModule } from "./sessions/sessions.module";
import { UserModule } from "./user/user.module";
import { FavoriteModule } from './favorite/favorite.module';
import { ProjectModule } from "./project/project.module";
import { LegalModule } from "./legal/legal.module";
import { MemberModule } from "./member/member.module";
@Module({
  imports: [
    AuthModule,
    UserModule,
    AuthorizationModule,
    ContactInfoModule,
    AddressModule,
    SessionsModule,
    RegistrationModule,
    PasswordResetModule,
    FavoriteModule,
    ProjectModule,
    LegalModule,
    MemberModule
  ],
})
export class UsersModule {}
