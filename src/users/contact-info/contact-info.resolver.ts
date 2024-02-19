import { ValidationPipe } from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { ContactInfoService } from "./contact-info.service";
import { CreateContactInfoInput } from "./dto/create-contact-info.input";
import { IndexContactInfoInput } from "./dto/index-contact-info.input";
import { PaginationContactInfoResponse } from "./dto/pagination-contact-info.response";
import { UpdateContactInfoInput } from "./dto/update-contact-info.input";
import { ContactInfo } from "./entities/contact-info.entity";
import { Permission } from "../authorization/permission.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { User } from "../user/entities/user.entity";
import { Country } from "src/base/location/country/entities/country.entity";

@Resolver(() => ContactInfo)
export class ContactInfoResolver {
  constructor(private readonly contactInfoService: ContactInfoService) {}

  @Permission("gql.users.contact_info.store")
  @Mutation(() => ContactInfo)
  createContactInfo(
    @Args("createContactInfoInput")
    createContactInfoInput: CreateContactInfoInput,
  ) {
    return this.contactInfoService.create(createContactInfoInput);
  }

  @Permission("gql.users.contact_info.index")
  @Query(() => PaginationContactInfoResponse, { name: "contactInfos" })
  findAll(
    @Args(
      "indexContactInfoInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexContactInfoInput?: IndexContactInfoInput,
  ) {
    return this.contactInfoService.paginate(indexContactInfoInput);
  }

  @Permission("gql.users.contact_info.show")
  @Query(() => ContactInfo, { name: "contactInfo" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.contactInfoService.findOne(id);
  }

  @Permission("gql.users.contact_info.update")
  @Mutation(() => ContactInfo)
  updateContactInfo(
    @Args("updateContactInfoInput")
    updateContactInfoInput: UpdateContactInfoInput,
    @CurrentUser() user: User,
  ) {
    return this.contactInfoService.update(
      updateContactInfoInput.id,
      updateContactInfoInput,
      user,
    );
  }

  @Permission("gql.users.contact_info.destroy")
  @Mutation(() => ContactInfo)
  removeContactInfo(@Args("id", { type: () => Int }) id: number) {
    return this.contactInfoService.remove(id);
  }

  @ResolveField(() => Country)
  async city(@Parent() contactInfo: ContactInfo): Promise<Country> {
    return this.contactInfoService.getCountryOf(contactInfo);
  }

  @ResolveField(() => User)
  async admin(@Parent() contactInfo: ContactInfo): Promise<User> {
    return this.contactInfoService.getAdminOf(contactInfo);
  }
}
