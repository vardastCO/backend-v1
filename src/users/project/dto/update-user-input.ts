import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString
} from "class-validator";
import { CreateUserProjectInput } from "./create-user-project.input";
import { UserTypeProject } from "../enums/type-user-project.enum";



@InputType()
export class UpdateProjectUserInput extends PartialType(CreateUserProjectInput) {
    @Field(() => Int)
    @IsNotEmpty()
    @IsInt()
    projectId: number;

    @Field(() => Int)
    @IsNotEmpty()
    @IsInt()
    userId: number;

    @Field()
    @IsNotEmpty()
    @IsString()
    cellphone: string;

    @Field(() => UserTypeProject)
    @IsNotEmpty()
    @IsEnum(UserTypeProject)
    type: UserTypeProject;
}


