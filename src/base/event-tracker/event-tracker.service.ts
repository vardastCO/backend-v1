import { User } from "src/users/user/entities/user.entity";
import { CreateEventTrackerInput } from "./dto/create-event-tracker.input";
import { EventTracker } from "./entities/event-tracker.entity";
import { PayloadDto } from "src/products/brand/dto/payload-brand";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";

@Injectable()
export class EventTrackerService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(
    payload:PayloadDto
  ) :  Promise<boolean>{
    try {
      const viewsKey = `contact_views_${payload}`;

      const views: any[] = [];
  
      views.push(payload);

      await this.cacheManager.set(viewsKey, views);
      return Promise.resolve(true);
      
    } catch (e) {
      console.log('contact_views', e) 
      return Promise.resolve(false);
    }
  }

  findAll() {
    return `This action returns all eventTracker`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventTracker`;
  }
}
