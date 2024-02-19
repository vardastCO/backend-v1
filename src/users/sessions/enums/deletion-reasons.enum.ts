import { registerEnumType } from "@nestjs/graphql";

export enum DeletionReasons {
  LOGOUT = 0,
  TERMINATED = 1,
  TERMINATED_BY_ADMIN = 2,
}

registerEnumType(DeletionReasons, {
  name: "DeletionReasons",
});
