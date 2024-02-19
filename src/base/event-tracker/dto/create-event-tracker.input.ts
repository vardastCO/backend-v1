import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { EventTrackerSubjectTypes } from "../enums/event-tracker-subject-types.enum";
import { EventTrackerTypes } from "../enums/event-tracker-types.enum";

@InputType()
export class CreateEventTrackerInput {
  @Field(() => EventTrackerTypes)
  @IsNotEmpty()
  type: EventTrackerTypes;

  @Field(() => EventTrackerSubjectTypes)
  @IsNotEmpty()
  subjectType: EventTrackerSubjectTypes;

  @Field(() => Int)
  @IsNotEmpty()
  subjectId: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  url: string;

  userId: number;
  agent: string;
  ipAddress: string;
}
