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
import { PreOrder } from "../preOrder/entities/pre-order.entity";
import { Line } from "../line/entities/order-line.entity";
import { AddSellerOrderOffer } from "./dto/add-seller-offer.input";
import { TempSeller } from "./entities/temp-seller.entity";
import { UpdateOrderOfferInput } from "./dto/update-order-offer.input";
import { OrderOfferStatuses } from "./enums/order-offer-statuses";

@Injectable()
export class OrderOfferService {
  constructor( 
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectDataSource() private readonly dataSource: DataSource)
     { }

  
  async addSellerOrderOffer(addSellerOrderOffer: AddSellerOrderOffer) {
    
      const temp: TempSeller = TempSeller.create<TempSeller>(addSellerOrderOffer);
    
      await temp.save();

       
      let  result  =  await OfferOrder.findOne({
        where: { id: addSellerOrderOffer.orderOfferId },
        relations: ['offerLine'],
        order: {
          id: 'DESC'
        }
      });
    
      result.tempSellerId = temp.id
      await result.save()

      return result
      
    }
    async createOffer(createOrderOfferInput:CreateOrderOfferInput,user:User): Promise<OfferOrder> {
    
      try {
        let order = await OfferOrder.findOne({
          where: {
            userId: user.id,
            preOrder :  {
              id : createOrderOfferInput.preOrderId
            },
            status: OrderOfferStatuses.PENDING
          },
          relations: ['offerLine'],
          order: {
            id: 'DESC'
          }
        })
        if (order) {
          return order
        }
        const newOrder: OfferOrder = OfferOrder.create<OfferOrder>(createOrderOfferInput);
        newOrder.userId =  user.id
      

        await newOrder.save();

        return await OfferOrder.findOne({
          where: { id: newOrder.id },
          relations: ['offerLine'],
          order: {
            id: 'DESC'
          }
        });
      } catch (error) {

        console.log('createOffer err',error)
        
      }
    
  }
  async calculatePriceOfferLine(lineId: number,fi_price:string) {
    const line = await Line.findOneBy({ id: lineId })
    if (line) {
      return {
        "fi_price": fi_price,
        "tax_price": ((parseInt(fi_price, 10) * parseInt(line.qty)) * .1).toString(),
        "total_price" : ((parseInt(fi_price, 10) * parseInt(line.qty)) * 1.1).toString()
      }
    }
  }
  
  async createOrderOfferLine(createLineOfferInput:CreateLineOfferInput,user:User): Promise<OfferOrder> {
  
    try {
      const result: OfferOrder = await OfferOrder.findOne({
        where: { id: createLineOfferInput.offerOrderId },
        relations: ['offerLine'],
        order: {
          id: 'DESC'
        }
      });
      console.log('result',result)
        const offerline = await OfferLine.findOneBy({
          offerOrderId: createLineOfferInput.offerOrderId,
          lineId : createLineOfferInput.lineId
        })
        
        if (offerline) {
          const id = offerline.id
          const amount = offerline.total_price
          const things: OfferLine = await OfferLine.preload({
            id,
            ...createLineOfferInput,
          });
          result.total =
            (parseInt(things.total_price) + parseInt(createLineOfferInput.total_price) - parseInt(amount)).toString()
          await result.save()
          
          await things.save()
          
        } else {
          console.log('no')
          const newOrder: OfferLine = OfferLine.create<OfferLine>(createLineOfferInput);
          newOrder.userId = user.id
          newOrder.offerOrderId = createLineOfferInput.offerOrderId
          result.total =
            (parseInt(await result.total) + parseInt(createLineOfferInput.total_price)).toString()
          await result.save()
          await newOrder.save();
         

        }
        
     

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
        if (!OfferOrderLine) {
          throw new Error("Not Found Offer Order")
        }

        const offerOrderId = OfferOrderLine.offerOrderId;

        await OfferOrderLine.remove();
        
        const offerOrder = await OfferOrder.findOne({
          where: {id: offerOrderId},
          relations: ['offerLine'],
          order: {
            id: 'DESC'
          }
        });
        return offerOrder
      } catch (error) {

        console.log('removeOrderOfferLine err',error)
      }
    
  }

  async updateOrderOffer(updateOrderOfferInput : UpdateOrderOfferInput): Promise<OfferOrder> {
    
    try {
      const offerOrder = await OfferOrder.findOne({
        where: {id: updateOrderOfferInput.id},
        relations: ['offerLine'],
        order: {
          id: 'DESC'
        }
      });
      offerOrder.status =
        updateOrderOfferInput.status as OrderOfferStatuses ?? OrderOfferStatuses.PENDING
      await offerOrder.save()
      return offerOrder
    } catch (error) {

      console.log('updateOrderOffer err',error)
    }
  
}

  async getOffer(id: number): Promise<OfferOrder> {
    try {
      
      const orderOffer: OfferOrder = await OfferOrder.findOne({
        where: { id },
        relations: ['offerLine'],
        order: {
          id: 'DESC'
        }
      });
      return orderOffer
    } catch (error) {
      throw error;
    }
  }
    
}
