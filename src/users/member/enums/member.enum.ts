import { registerEnumType } from "@nestjs/graphql";

export enum MemberRoles {
  ADMIN = "0",
  ZERO_LEVEL = "1"
}
registerEnumType(MemberRoles, {
  name: "MemberRoles",
});
