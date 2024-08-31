import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Public } from "src/users/auth/decorators/public.decorator";
import { CreateFaqInput } from "./dto/create-faq.input";
import { UpdateFaqInput } from "./dto/update-faq.input";
import { FAQ } from "./entities/faq.entity";
import { FaqService } from "./faq.service";

@Resolver(() => FAQ)
export class FaqResolver {
  constructor(private readonly faqService: FaqService) {}

  @Public()
  @Query(() => FAQ, { name: "faq" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.faqService.findOne(id);
  }

  @Public()
  @Query(() => [FAQ], { name: "faqs" })
  getAllFaqs() {
    return this.faqService.getAllFaqs();
  }

  @Public()
  @Mutation(() => FAQ)
  updateFaq(@Args("updateFaqInput") updateFaqInput: UpdateFaqInput) {
    return this.faqService.update(updateFaqInput.id, updateFaqInput);
  }

  @Public()
  @Mutation(() => FAQ)
  removeFaq(@Args("id", { type: () => Int }) id: number) {
    return this.faqService.remove(id);
  }

  @Public()
  @Mutation(() => FAQ)
  createFaq(@Args("createFaqInput") createFaqInput: CreateFaqInput) {
    return this.faqService.createFaq(createFaqInput);
  }
}
