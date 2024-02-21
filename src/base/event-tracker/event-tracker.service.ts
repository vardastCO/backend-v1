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
  ) : Promise<EventTracker> {
    if (user) {
      createEventTrackerInput.userId = user.id;
    }

    createEventTrackerInput.ipAddress = request.ip ?? "0.0.0.0";
    createEventTrackerInput.agent = request.headers["user-agent"] ?? "Unknown";
    const event: EventTracker = EventTracker.create<EventTracker>(createEventTrackerInput);

    // Save the event in the cache
    // cache.set(`event:${event.id}`, event);
    const event_ex: EventTracker = {
      id: 1,
      type: EventTrackerTypes.VIEW_OFFER,
      ipAddress: '127.0.0.1',
      agent: 'Agent Name', // Replace with the actual agent value
      subjectType: EventTrackerSubjectTypes.ADDRESS,
      subjectId: 123,
      url: 'https://example.com',
      userId: 456, // Assuming userId is equivalent to user's ID
      user: null,
      createdAt: new Date() // Assuming createdAtt is a timestamp or Date object
    };
    
    
    return event_ex; 
   
  }

  findAll() {
    return `This action returns all eventTracker`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventTracker`;
  }
}
