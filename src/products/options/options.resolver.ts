import { OptionsService } from "./options.service";
import { CreateOptionInput } from "./dto/option.dto";
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Option } from "./entities/option.entity";
import { Public } from "src/users/auth/decorators/public.decorator";
import { ValidationPipe } from "@nestjs/common";

@Resolver(() => Option)
export class OptionsResolver {
  constructor(private readonly optionsService: OptionsService) {}

  @Public()
  @Mutation(() => Option)
  async createOption(
    @Args("createOptionInput") createOptionInput: CreateOptionInput,
  ): Promise<Option> {
    return await this.optionsService.create(createOptionInput);
  }

  //   @Mutation('updateOption')
  //   async updateOption(@Args('id') id: number, @Args('input') input: CreateOptionInput) {
  //     return this.optionsService.update(id, input);
  //   }

  //   @Mutation('deleteOption')
  //   async deleteOption(@Args('id') id: number) {
  //     return this.optionsService.delete(id);
  //   }
}
