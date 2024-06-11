import { registerEnumType } from "@nestjs/graphql";

export enum TypeMember {
  LEGAL = "LEGAL",
}

registerEnumType(TypeMember, {
  name: "TypeMember",
});
