import { Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { AddFilePreOrderInput } from './dto/add-pre-order-file.input';
import { User } from 'src/users/user/entities/user.entity';

@Injectable()
export class PreFileService {
  constructor( 
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectDataSource() private readonly dataSource: DataSource)
     { }
     
     async removeFilePreOrder( id: number,user:User): Promise<Boolean> {
    
      try {
        const cacheKey = `file_pre_order_{id:${id}}`;
        const keyExists = await this.cacheManager.get(cacheKey);
        if (keyExists) {
          await this.cacheManager.del(cacheKey);
        }

  

        return true
      } catch (error) {

        console.log('add File Pre Order err',error)
        return false
        
      }   
    
      }
     async addFilePreOrder( addFilePreOrderInput: AddFilePreOrderInput,user:User): Promise<Boolean> {
    
      try {
        const cacheKey = `file_pre_order_{id:${addFilePreOrderInput.pre_order_id}}`;
        const keyExists = await this.cacheManager.get(cacheKey);
        if (keyExists) {
          await this.cacheManager.del(cacheKey);
        }

  

        return true
      } catch (error) {

        console.log('addFilePreOrder err',error)
        return false
        
      }   
    
      }


    
}
