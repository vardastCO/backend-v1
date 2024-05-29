import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import {
    IsInt,
    IsNotEmpty,
    IsString
} from "class-validator";
import { CreateUserProjectInput } from "./create-user-project.input";



@InputType()
export class UpdateProjectUserInput extends PartialType(CreateUserProjectInput) {
    @Field(() => Int)
    @IsNotEmpty()
    @IsInt()
    projectId: number;

    @Field()
    @IsNotEmpty()
    @IsString()
    cellphone: String;
}


