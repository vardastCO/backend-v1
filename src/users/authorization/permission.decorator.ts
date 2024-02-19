import { SetMetadata } from "@nestjs/common";

export const Permission = (permissionName: string) =>
  SetMetadata("permission", permissionName);
