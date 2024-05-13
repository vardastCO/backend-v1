import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { BidService } from './bid.service';




@Resolver(() => Boolean)
export class BidResolver {
  constructor(private readonly bidService : BidService) {}

  // @Public()
  // @Mutation(() => Boolean)
  // createTempOrder(
  //   // @Args("createBrandInput") createBrandInput: CreateBrandInput,
  // ) {
  //   return this.bidService.createTempOrder();
  // }

}
