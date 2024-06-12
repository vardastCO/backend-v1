import { registerEnumType } from "@nestjs/graphql";

export enum UserTypeProject {
  MANAGER = "1",
  EMPLOYER = "2",
}

registerEnumType(UserTypeProject, {
  name: "UserTypeProject",
});
