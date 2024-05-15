import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { User } from 'src/users/user/entities/user.entity';
import { DataSource } from "typeorm";
import { ThreeStateSupervisionStatuses } from '../enums/three-state-supervision-statuses.enum';
import { CreateLineOfferInput } from './dto/create-line-offer.input';
import { CreateOrderOfferInput } from './dto/create-order-offer.input';
import { OfferLine } from './entities/offer-line.entity';
import { OfferOrder } from './entities/order-offer.entity';

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
     
          const result =   await OfferOrder.findOneBy({
            id : createLineOfferInput.offerOrderId
          });
   
          return result
        } catch (error) {
  
          console.log('createOffer err',error)
          
        }
      
    }

    async removeOrderOfferLine(id: number): Promise<OfferOrder> {
    
      try {
      

        const OfferOrderLine: OfferLine = await OfferLine.findOne({
          where: {id: id}
        })
        
        const offerOrderId = OfferOrderLine.offerOrderId;
        await OfferOrderLine.remove();

        const offerOrder = await OfferOrder.findOne({
          where: {id: offerOrderId}
        })
        return offerOrder
      } catch (error) {

        console.log('removeOrderOfferLine err',error)
      }
    
  }

  async getOffer(id: number): Promise<OfferOrder> {
    try {
      const orderOffer: OfferOrder = await OfferOrder.findOneBy({ id: id });
      return orderOffer
    } catch (error) {
      throw error;
    }
  }
    
}
