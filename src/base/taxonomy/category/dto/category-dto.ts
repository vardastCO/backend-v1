import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class CategoryDTO {
    @Field(type => Int)
    id: number;

    @Field()
    title: string;

    @Field(type => [CategoryDTO], { nullable: true })
    children?: CategoryDTO[];
}
