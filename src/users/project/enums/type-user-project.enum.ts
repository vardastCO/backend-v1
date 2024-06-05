import { registerEnumType } from "@nestjs/graphql";

export enum TypeUserProject {
  MANAGER = "1",
  EMPLOYER = "2",
}

registerEnumType(TypeUserProject, {
  name: "TypeUserProject",
});
