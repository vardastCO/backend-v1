import { ExecutionContext } from "@nestjs/common";
import { Args, Context, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { Public } from "src/users/auth/decorators/public.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { User } from "src/users/user/entities/user.entity";
import { Request } from "../utilities/decorators/request.decorator";
import { CreateEventTrackerInput } from "./dto/create-event-tracker.input";
import { EventTracker } from "./entities/event-tracker.entity";
import { EventTrackerService } from "./event-tracker.service";
import { PayloadDto } from "src/products/brand/dto/payload-brand";


@Resolver(() => EventTracker)
export class EventTrackerResolver {
  constructor(private readonly eventTrackerService: EventTrackerService) {}

  @Public()
  @Mutation(() => Boolean)
    
  @Permission("gql.base.event_tracker.create")
  createEventTracker(
    @Args("createEventTrackerInput")
    createEventTrackerInput: CreateEventTrackerInput,
    @CurrentUser() user: User,
    @Context() context: ExecutionContext,
    @Request() request,
  )  : Promise<void> {

    const userPhone = context.user ? context.user.phone : null;
    const payload : PayloadDto = {
      ip: context.req.headers['x-real-ip'],
      clientIp: context.req.connection.remoteAddress,
      phone: userPhone,
      timestamp: new Date().toISOString(),
    };
    return this.eventTrackerService.create(
      payload
    );
  }

  @Permission("gql.base.event_tracker.index")
  @Query(() => [EventTracker], { name: "eventTrackers" })
  findAll() {
    return this.eventTrackerService.findAll();
  }

  @Permission("gql.base.event_tracker.show")
  @Query(() => EventTracker, { name: "eventTracker" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.eventTrackerService.findOne(id);
  }
}
