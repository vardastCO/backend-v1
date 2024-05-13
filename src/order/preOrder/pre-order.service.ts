import { Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { User } from 'src/users/user/entities/user.entity';
import { CreatePreOrderInput } from './dto/create-pre-order.input';
import { PreOrder } from './entities/pre-order.entity';
import { PreOrderStates } from '../enums/pre-order-states.enum';

@Injectable()
export class PreOrderService {
  constructor( 
   
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectDataSource() private readonly dataSource: DataSource)
     { }

    async createPreOrder(createPreOrderInput : CreatePreOrderInput,user:User): Promise<PreOrder> {
    
      try {
        let order = await PreOrder.findOneBy({
          userId : user.id,
          status : PreOrderStates.CREATED
        });
        if (order) {
          return order
        }
        const newOrder: PreOrder = PreOrder.create<PreOrder>(createPreOrderInput);
        newOrder.userId =  user.id
      

        await newOrder.save();

        return newOrder
      } catch (error) {

        console.log('create_pre_order err',error)
        
      }
    
    }
    async findPreOrderById(id : number,user:User): Promise<PreOrder> {
    
      try {
        let order = await PreOrder.findOneBy({
          id : id,
        });
        if (order) {
          return order
        }

        return 
      } catch (error) {

        console.log('create_pre_order err',error)
        
      }
    
    }
   
    
}
