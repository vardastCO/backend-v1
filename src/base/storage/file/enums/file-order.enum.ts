import { registerEnumType } from "@nestjs/graphql";

export enum FileOrderEnum {
  NEAREST = 0,
  LONGEST = 1,
}

registerEnumType(FileOrderEnum, {
  name: "FileOrderEnum",
});
