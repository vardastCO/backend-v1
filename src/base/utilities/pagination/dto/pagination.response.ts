import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "typeorm";
import { PaginationInput } from "./pagination.input";

@ObjectType()
export class PaginationResponse {
  @Field(type => Int)
  total: number;

  @Field(type => Int)
  perPage: number;

  @Field(type => Int)
  currentPage: number;

  @Field(type => Int)
  lastPage: number;

  @Field(type => Int)
  from: number;

  @Field(type => Int)
  to: number;

  data;

  static make(
    paginationInput: PaginationInput,
    total: number,
    data: BaseEntity[],
  ): PaginationResponse {
    const { page, perPage } = paginationInput;
    const lastPage = Math.ceil(total / perPage);
    const to = page > lastPage ? 0 : page * perPage;
    return Object.assign(new this(), {
      total,
      perPage,
      currentPage: page,
      lastPage,
      from: page > lastPage ? 0 : (page - 1) * perPage + 1,
      to: total < to ? total : to,
      data,
    });
  }
}
