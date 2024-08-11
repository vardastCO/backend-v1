import { registerEnumType } from "@nestjs/graphql";

export enum MemberRoles {
  ADMIN = "ADMIN",
  ZERO_LEVEL = "ZERO_LEVEL"
}
registerEnumType(MemberRoles, {
  name: "MemberRoles",
});
