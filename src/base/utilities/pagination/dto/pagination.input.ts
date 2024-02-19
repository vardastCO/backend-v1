import { Field, InputType, Int } from "@nestjs/graphql";
import { IsOptional, IsPositive, Max, Min } from "class-validator";

@InputType()
export class PaginationInput {
  skip?: number;
  take?: number;

  @Field(type => Int, { nullable: true })
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @Field(type => Int, { nullable: true, defaultValue: 16 })
  @IsPositive()
  @Min(1)
  @Max(200)
  @IsOptional()
  perPage?: number = 16;

  public boot?(): this {
    this.take = this.perPage;
    this.skip = this.perPage * (this.page - 1);
    return this;
  }
}
