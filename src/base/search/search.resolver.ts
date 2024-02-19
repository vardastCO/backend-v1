import { Args, Query, Resolver } from "@nestjs/graphql";
import { Public } from "src/users/auth/decorators/public.decorator";
import { FilterableAttributesInput } from "./dto/filterable-attributes.input";
import { FilterableAttributesResponse } from "./dto/filterable-attributes.response";
import { SuggestInput } from "./dto/suggest.input";
import { SuggestResponse } from "./dto/suggest.response";
import { SearchService } from "./search.service";
import { FilterableAttributeResponse } from "./dto/filterable-attribute.response";
import { FilterableAttributeInput } from "./dto/filterable-attribute.input";
import { SuggestResponseV2 } from "./dto/suggest.response-v2";

@Resolver()
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

  // @Public()
  // @Query(() => SearchResponse, { name: "search" })
  // search(
  //   @Args("searchInput", new ValidationPipe({ transform: true }))
  //   searchInput?: SearchInput,
  // ) {
  //   return this.searchService.search(searchInput);
  // }

  @Public()
  @Query(() => SuggestResponse, { name: "suggest" })
  suggest(
    @Args("suggestInput")
    suggestInput?: SuggestInput,
  ) {
    return this.searchService.suggest(suggestInput);
  }

  @Public()
  @Query(() => SuggestResponseV2, { name: "suggestV2" })
  suggestV2(
    @Args("suggestInput")
    suggestInput?: SuggestInput,
  ) {
    return this.searchService.suggestv2(suggestInput);
  }

  @Public()
  @Query(() => FilterableAttributesResponse, { name: "filterableAttributes" })
  filters(
    @Args("filterableAttributesInput")
    filterableAttributes?: FilterableAttributesInput,
  ) {
    return this.searchService.filters(filterableAttributes);
  }

  @Public()
  @Query(() => FilterableAttributesResponse, { name: "filterableAdminAttributes" })
  filterAdmin(
    @Args("filterableAdminAttributes")
    filterableAttributes?: FilterableAttributesInput,
  ) {
    return this.searchService.filterAdmin(filterableAttributes);
  }

  @Public()
  @Query(() => FilterableAttributeResponse, { name: "filterableAttribute" })
  filter(
    @Args("filterInput")
    filterInput?: FilterableAttributeInput,
  ) {
    return this.searchService.filter(filterInput);
  }
}
