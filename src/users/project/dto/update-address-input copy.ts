import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import {
    IsInt,
    IsNotEmpty
} from "class-validator";
import { CreateAddressProjectInput } from "./create-address-project.input";



@InputType()
export class UpdateProjectAddressInput extends PartialType(CreateAddressProjectInput) {
    @Field(() => Int)
    @IsNotEmpty()
    @IsInt()
    id: number;
}


