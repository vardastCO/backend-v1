import { ValidationPipe } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Public } from "src/users/auth/decorators/public.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { ContactUsService } from "./contactus.service";
import { CreateContactInput } from "./dto/create-contact.input";
import { IndexContactInput } from "./dto/IndexContactInput";
import { PaginationContactUsResponse } from "./dto/PaginationContactUsResponse";
import { UpdateContactUsInput } from "./dto/update-member.input";
import { ContactUs } from "./entities/Contact.entity";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { User } from "src/users/user/entities/user.entity";

@Resolver(() => ContactUs)
export class ContactResolver {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Public()
  @Query(() => ContactUs, { name: "findOneContactUs" })
  findOneContactUs(@Args("id", { type: () => Int }) id: number) {
    return this.contactUsService.findOneContactUs(id);
  }

  @Public()
  @Query(() => PaginationContactUsResponse, { name: "getAllContactUs" })
  getAllContactUs(
    @Args(
      "indexContactInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexContactInput?: IndexContactInput,
  ) {
    return this.contactUsService.getAllContactUs(indexContactInput);
  }

  @Permission("gql.products.seller_representative.update")
  @Mutation(() => ContactUs)
  createContactUs(
    @Args("createContactInput") createContactInput: CreateContactInput,
    @CurrentUser() user: User,
  ) {
    return this.contactUsService.createContactUs(createContactInput, user);
  }

  @Permission("gql.products.seller_representative.update")
  @Mutation(() => ContactUs, { name: "updateContactUs" })
  updateContactUs(
    @Args("updateContactUs") updateContactUs: UpdateContactUsInput,
  ) {
    return this.contactUsService.updateContactUs(
      updateContactUs.id,
      updateContactUs,
    );
  }

  @Permission("gql.products.seller_representative.update")
  @Mutation(() => Boolean)
  removeContactUs(@Args("id", { type: () => Int }) id: number) {
    return this.contactUsService.removeContactUs(id);
  }
}
