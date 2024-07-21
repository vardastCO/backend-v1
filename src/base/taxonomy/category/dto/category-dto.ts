import { InputType } from "@nestjs/graphql";


@InputType()
export class CategoryDTO {
  id: string;
  title: string;
  children: CategoryDTO[] = [];
}

