import { registerEnumType } from "@nestjs/graphql";

export enum ModelOffer {
  QUOTATION = "1", 
  PROPOSAL = "2", 
  
}

registerEnumType(ModelOffer, {
  name: "ModelOffer",
});