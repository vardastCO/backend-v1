import { registerEnumType } from "@nestjs/graphql";

export enum MemberRoles {
  ADMIN = "ADMIN",
  ZEROLEVEL = "ZEROLEVEL"
}
registerEnumType(MemberRoles, {
  name: "MemberRoles",
});
