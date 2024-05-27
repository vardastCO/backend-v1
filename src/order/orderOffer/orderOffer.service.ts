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
        newOrder.userId = user.id
        
        newOrder.created_at = new Date().toLocaleString("en-US", { timeZone: "Asia/Tehran" })
        newOrder.request_name = user.fullName ?? 'کاربر'
        
        await newOrder.save();

        const  offer =  await OfferOrder.findOne({
          where: { id: newOrder.id },
          relations: ['offerLine'],
          order: {
            id: 'DESC'
          }
        });
        offer.total = '0'
        offer.total_tax = '0'
        offer.total_fi = '0'
        const lines = await (await offer.preOrder).lines;
        lines.map(async (line) => {
          const newOffer = new OfferLine;
          newOffer.userId = user.id
          newOffer.total_price = '0'
          newOffer.offerOrderId = newOrder.id
          newOffer.lineId = line.id
        
          await newOffer.save();
        })
        
        return offer
      } catch (error) {

        console.log('createOffer err',error)
        
      }
    
  }
  async calculatePriceOfferLine(lineId: number, fi_price: string) {
    const line = await Line.findOneBy({ id: lineId });
    if (line) {
      const fiPrice = parseFloat(fi_price);
      const qty = parseInt(line.qty, 10);
      const taxPrice = Math.round(fiPrice * qty * 0.1);
      const totalPrice = Math.round(fiPrice * qty * 1.1);
  
      return {
        "fi_price": fi_price,
        "tax_price": taxPrice.toString(),
        "total_price": totalPrice.toString()
      };
    }
  }
  
  async createOrderOfferLine(createLineOfferInput:CreateLineOfferInput,user:User): Promise<OfferOrder> {
  
    try {
        const offer: OfferOrder = await OfferOrder.findOne({
          where: { id: createLineOfferInput.offerOrderId },
          relations: ['offerLine'],
          order: {
            id: 'DESC'
          }
        });
        const offerline = await OfferLine.findOneBy({
          offerOrderId: createLineOfferInput.offerOrderId,
          lineId : createLineOfferInput.lineId
        })
        
        if (offerline) {
          const id = offerline.id
          const lastTotal = offerline.total_price
          const lastFi    = offerline.total_fi
          const lastTax   = offerline.total_tax

          const newOfferLine: OfferLine = await OfferLine.preload({
            id,
            ...createLineOfferInput,
          });
          offer.total =
            ( parseInt(offer.total_fi) + 
              parseInt(createLineOfferInput.total_price) -
              parseInt(lastTotal)).toString()
          offer.total_tax =
            ( parseInt(offer.total_fi) + 
              parseInt(createLineOfferInput.tax_price) -
              parseInt(lastTax)).toString()
          offer.total_fi =
            ( parseInt(offer.total_fi) + 
              parseInt(createLineOfferInput.fi_price) -
              parseInt(lastFi)).toString()
          await offer.save()
          
          await newOfferLine.save()
          
        } 

        return offer
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
