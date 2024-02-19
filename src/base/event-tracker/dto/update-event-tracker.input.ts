import { CreateEventTrackerInput } from './create-event-tracker.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateEventTrackerInput extends PartialType(CreateEventTrackerInput) {
  @Field(() => Int)
  id: number;
}
