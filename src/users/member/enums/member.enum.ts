import { registerEnumType } from "@nestjs/graphql";

export enum MemberRoles {
  ADMIN = "admin",
  ZERO_LEVEL = "zero_level"
}
registerEnumType(MemberRoles, {
  name: "MemberRoles",
});
