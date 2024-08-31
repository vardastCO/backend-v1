import { Field, InputType, Int } from "@nestjs/graphql";
import { IndexInput } from "src/base/utilities/dto/index.input";

@InputType()
export class IndexProductInputV2 extends IndexInput {}
