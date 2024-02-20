import { Injectable } from "@nestjs/common";
import { User } from "src/users/user/entities/user.entity";
import { CreateEventTrackerInput } from "./dto/create-event-tracker.input";
import { EventTracker } from "./entities/event-tracker.entity";

@Injectable()
export class EventTrackerService {
  async create(
    createEventTrackerInput: CreateEventTrackerInput,
    user: User,
    request,
  ) {
    
    if (user) {
      createEventTrackerInput.userId = user.id;
    }

    createEventTrackerInput.ipAddress = request.ip ?? "0.0.0.0";
    createEventTrackerInput.agent = request.headers["user-agent"] ?? "Unknown";

    const event = EventTracker.create<EventTracker>(createEventTrackerInput);
    await event.save();

    return event;
  }

  findAll() {
    return `This action returns all eventTracker`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventTracker`;
  }
}
