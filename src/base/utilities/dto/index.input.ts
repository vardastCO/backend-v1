import { InputType } from "@nestjs/graphql";
import { PaginationInput } from "../pagination/dto/pagination.input";

@InputType()
export class IndexInput extends PaginationInput {}
