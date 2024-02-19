import { registerEnumType } from "@nestjs/graphql";

export enum PermissionActionsEnum {
  MANAGE = "manage",
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
}

registerEnumType(PermissionActionsEnum, {
  name: "PermissionActionsEnum",
});
