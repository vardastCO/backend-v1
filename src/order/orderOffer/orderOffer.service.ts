import { Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreateOrderOfferInput } from './dto/create-order-offer.input';
import { OfferOrder } from './entities/order-offer.entity';
import { User } from 'src/users/user/entities/user.entity';
import { ThreeStateSupervisionStatuses } from '../enums/three-state-supervision-statuses.enum';
import { CreateLineOfferInput } from './dto/create-line-offer.input';
import { OfferLine } from './entities/offer-line.entity';

@Injectable()
export class OrderOfferService {
  constructor( 
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectDataSource() private readonly dataSource: DataSource)
     { }

    async createOffer(createOrderOfferInput:CreateOrderOfferInput,user:User): Promise<OfferOrder> {
    
      try {
        let order = await OfferOrder.findOneBy({
          userId : user.id,
          status : ThreeStateSupervisionStatuses.PENDING
        });
        if (order) {
          return order
        }
        const newOrder: OfferOrder = OfferOrder.create<OfferOrder>(createOrderOfferInput);
        newOrder.userId =  user.id
      

        await newOrder.save();

        return newOrder
      } catch (error) {

        console.log('createOffer err',error)
        
      }
    
      }
    async createOrderOfferLine(createLineOfferInput:CreateLineOfferInput,user:User): Promise<OfferOrder> {
    
        try {
        
          const newOrder: OfferLine = OfferLine.create<OfferLine>(createLineOfferInput);
          newOrder.userId =  user.id
        
          await newOrder.save();
  
          return  await OfferOrder.findOneBy({
            id : createLineOfferInput.offerOrderId
          });
        } catch (error) {
  
          console.log('createOffer err',error)
          
        }
      
    }

    
}
