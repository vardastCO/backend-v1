import { Injectable } from "@nestjs/common";
import { User } from "src/users/user/entities/user.entity";
import { CreateEventTrackerInput } from "./dto/create-event-tracker.input";
import { EventTracker } from "./entities/event-tracker.entity";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from "../utilities/cache-ttl.util";
@Injectable()
export class EventTrackerService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  async create(
    createEventTrackerInput: CreateEventTrackerInput,
    user: User,
    request,
  ): Promise<boolean> {
    const cacheKey = `eventTracker:${user ? user.id : "anonymous"}:${
      createEventTrackerInput.subjectId
    }`;

    if (user) {
      createEventTrackerInput.userId = user.id;
    }

    createEventTrackerInput.ipAddress = request.ip ?? "0.0.0.0";
    createEventTrackerInput.agent = request.headers["user-agent"] ?? "Unknown";
    const event: EventTracker = EventTracker.create<EventTracker>(
      createEventTrackerInput,
    );
    try {
      await this.cacheManager.set(
        cacheKey,
        JSON.stringify(event),
        CacheTTL.ONE_DAY,
      );
    } catch (e) {
      console.log("event", e);
    }

    return true;
  }

  findAll() {
    return `This action returns all eventTracker`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventTracker`;
  }
}
