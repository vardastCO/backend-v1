import { Injectable } from "@nestjs/common";
import { User } from "src/users/user/entities/user.entity";
import { CreateEventTrackerInput } from "./dto/create-event-tracker.input";
import { EventTracker } from "./entities/event-tracker.entity";
import { EventTrackerTypes } from "./enums/event-tracker-types.enum";
import { EventTrackerSubjectTypes } from "./enums/event-tracker-subject-types.enum";

@Injectable()
export class EventTrackerService {
  async create(
    createEventTrackerInput: CreateEventTrackerInput,
    user: User,
    request,
  ) : Promise<Boolean> {
    if (user) {
      createEventTrackerInput.userId = user.id;
    }

    createEventTrackerInput.ipAddress = request.ip ?? "0.0.0.0";
    createEventTrackerInput.agent = request.headers["user-agent"] ?? "Unknown";
    const event: EventTracker = EventTracker.create<EventTracker>(createEventTrackerInput);
    return true

    // Save the event in the cache
    // cache.set(`event:${event.id}`, event);
  }

  findAll() {
    return `This action returns all eventTracker`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventTracker`;
  }
}
