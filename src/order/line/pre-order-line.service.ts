import { Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreateLineInput } from './dto/create-pre-order.input';
import { User } from 'src/users/user/entities/user.entity';
import { LineDTO } from './dto/lineDTO';
import { Line } from './entities/order-line.entity';
import { PreOrder } from '../preOrder/entities/pre-order.entity';
import { PreOrderStatus } from '../enums/pre-order-states.enum';

@Injectable()
export class PreOrderLineService {
  constructor( 
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectDataSource() private readonly dataSource: DataSource)
     
     { }

     async creatline(createLineInput: CreateLineInput,user:User): Promise<PreOrder> {
       
       try {
        const line: Line = Line.create<Line>(createLineInput);
        line.userId = user.id
        await line.save();

        const result =  await PreOrder.findOne({
          where: { id: createLineInput.preOrderId},
          relations: ["files","lines"],
        })
        if (result.status = PreOrderStatus.VERIFIED) {
          result.status = PreOrderStatus.PENDING_LINE
          await result.save()
        }
        return result
        
      } catch (error) {

        console.log('create_line_order err',error)
        
      }
    
    }
    async removeline(id: number,user:User): Promise<Boolean> {
       
      try {
        const line = await Line.findOneBy({
         id
        })
        
        if (line) {
          await line.remove()
        }
       
       return true
      
     } catch (error) {

       console.log('create_line_order err',error)
       return false
     }
   
   }

    
}
