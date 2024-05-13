import { Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class BidService {
  constructor( 
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectDataSource() private readonly dataSource: DataSource)
     { }

     async createTempOrder(): Promise<Boolean> {
    
       return true
    
      }


    
}
