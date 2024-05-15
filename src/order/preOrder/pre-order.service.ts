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
import { UpdatePreOrderInput } from './dto/update-pre-order.input';

@Injectable()
export class PreOrderService {
  constructor( 
   
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectDataSource() private readonly dataSource: DataSource)
     { }
    async generateNumericUuid(length: number = 10): Promise<string> {
      const min = Math.pow(10, length - 1);
      const max = Math.pow(10, length) - 1;
      return Math.floor(Math.random() * (max - min + 1) + min).toString();
    }
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
        newOrder.uuid = await this.generateNumericUuid()
        newOrder.userId =  user.id
      

        await newOrder.save();

        return newOrder
      } catch (error) {

        console.log('create_pre_order err',error)
        
      }
    
    }
  async update(
    id: number,
    updatePreOrderInput: UpdatePreOrderInput,
    user: User,
  ): Promise<PreOrder> {
    const things: PreOrder = await PreOrder.preload({
      id,
      ...updatePreOrderInput,
    });
    if (!things) {
     return
    }
    if (things.status = PreOrderStates.CREATED) {
      things.status = PreOrderStates.ADDEDADRESS
    }
    await things.save()

    return things;
  }
    async findPreOrderById(id : number,user:User): Promise<PreOrder> {
    
      try {
        let order = await PreOrder.findOne({
          where: { id: id, },
          relations: ["files","lines"],
        })
        if (order) {
          return order
        }

        return 
      } catch (error) {

        console.log('create_pre_order err',error)
        
      }
    
    }
   
    
}
