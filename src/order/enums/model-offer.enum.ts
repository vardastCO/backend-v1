import { registerEnumType } from "@nestjs/graphql";

export enum ModelOffer {
  Quotation = "1",
  Proposal = "2", 
}

registerEnumType(ModelOffer, {
  name: "ModelOffer",
});