import { registerEnumType } from "@nestjs/graphql";

export enum MemberRoles {
  ADMIN = "admin",
}
registerEnumType(MemberRoles, {
  name: "MemberRoles",
});
