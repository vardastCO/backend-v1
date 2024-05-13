import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
} from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";


@InputType()
export class IndexProjectInput extends IndexInput {
}
