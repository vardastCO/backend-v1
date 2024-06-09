import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { Seller } from "src/products/seller/entities/seller.entity";
import { ContactInfo } from "src/users/contact-info/entities/contact-info.entity";
import { ContactInfoRelatedTypes } from "src/users/contact-info/enums/contact-info-related-types.enum";
import { ContactInfoTypes } from "src/users/contact-info/enums/contact-info-types.enum";
import { User } from 'src/users/user/entities/user.entity';
import { DataSource } from "typeorm";
import { PreOrderStatus } from "../enums/pre-order-states.enum";
import { TypeOrderOffer } from "../enums/type-order-offer.enum";
import { Line } from "../line/entities/order-line.entity";
import { AddSellerOrderOffer } from "./dto/add-seller-offer.input";
import { CreateLineOfferInput } from './dto/create-line-offer.input';
import { CreateOrderOfferInput } from './dto/create-order-offer.input';
import { UpdateOrderOfferInput } from "./dto/update-order-offer.input";
import { OfferLine } from './entities/offer-line.entity';
import { OfferOrder } from './entities/order-offer.entity';
import { OrderOfferStatuses } from "./enums/order-offer-statuses";

@Injectable()
export class OrderOfferService {
  constructor( 
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectDataSource() private readonly dataSource: DataSource)
     { }

    async generateNumericUuid(length: number = 10): Promise<string> {
      const min = Math.pow(10, length - 1);
      const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
   }
  
  async addSellerOrderOffer(addSellerOrderOffer: AddSellerOrderOffer,user:User) {
      const findTempSeller = await Seller.findOneBy({
        name: `${addSellerOrderOffer.seller_name} | ${addSellerOrderOffer.company_name}`,
      })
      

      let  offer  =  await OfferOrder.findOne({
        where: { id: addSellerOrderOffer.orderOfferId },
        relations: ['offerLine'],
        order: {
          id: 'DESC'
        }
      });
      if (!findTempSeller) {
        let seller: Seller = new Seller()
        seller.name = `${addSellerOrderOffer.seller_name} | ${addSellerOrderOffer.company_name}`
        seller.createdById = user.id
        await seller.save()
        let PhoneContact = new ContactInfo()
        PhoneContact.relatedId = seller.id
        PhoneContact.relatedType = ContactInfoRelatedTypes.SELLER
        PhoneContact.title = 'تلفن'
        PhoneContact.type = ContactInfoTypes.TEL
        PhoneContact.number = addSellerOrderOffer.phone
        await PhoneContact.save()
        let CellContact = new ContactInfo()
        CellContact.relatedType = ContactInfoRelatedTypes.SELLER
        PhoneContact.relatedId = seller.id
        PhoneContact.title = 'موبایل'
        CellContact.type = ContactInfoTypes.MOBILE
        CellContact.number = addSellerOrderOffer.cellphone
        await CellContact.save()
        offer.sellerId = seller.id
        offer.request_name = seller.name;
      } else {
        offer.sellerId = findTempSeller.id
        offer.request_name = findTempSeller.name
      }
    
     
      offer.type = TypeOrderOffer.SELLER
      offer.status = OrderOfferStatuses.INVOICE
    
      await offer.save()

      return offer
      
    }
  async createOffer(createOrderOfferInput:CreateOrderOfferInput,user:User): Promise<OfferOrder> {

      try {
        let order = await OfferOrder.findOne({
          where: {
            userId: user.id,
            preOrder :  {
              id : createOrderOfferInput.preOrderId
            },
            status: OrderOfferStatuses.PENDING_PRICE
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
        newOrder.uuid = await this.generateNumericUuid();
        newOrder.created_at = new Date().toLocaleString("en-US", { timeZone: "Asia/Tehran" })
        newOrder.request_name = user.fullName ??  'کاربر وردست';
        await newOrder.save();
        const preOrder = await newOrder.preOrder;
        if (preOrder) {
  
          preOrder.offersNum += 1;
       
          await preOrder.save();
        }

   
  

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
          const newOfferLine = new OfferLine;
          newOfferLine.userId = user.id
          newOfferLine.total_price = '0'
          newOfferLine.fi_price = '0'
          newOfferLine.tax_price = '0'
          newOfferLine.offerOrderId = newOrder.id
          newOfferLine.lineId = line.id
        
          await newOfferLine.save();
        })
        
        return offer
      } catch (error) {

        console.log('createOffer err',error)
        
      }
    
  }
  async calculatePriceOfferLine(lineId: number, fi_price: string,with_tax:boolean) {
    if (fi_price == '0') {
      return {
        "fi_price": '0',
        "tax_price": '0',
        "total_price": '0'
      };
    }
    const line = await Line.findOneBy({ id: lineId });
    if (line) {
      const fiPrice = parseFloat(fi_price);

      const qty = parseInt(line.qty, 10);

      const taxPrice = Math.round(fiPrice * qty * 0.1);

      const totalPriceWithTax = Math.round(fiPrice * qty * 1.1);
      const totalPrice = Math.round(fiPrice * qty );
    
      return {
        "fi_price": fi_price,
        "tax_price": with_tax ? taxPrice.toString() : "0",
        "total_price": with_tax ?  totalPriceWithTax.toString() :  totalPrice
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
          const lastFi    = offerline.fi_price
          const lastTax   = offerline.tax_price

          const newOfferLine: OfferLine = await OfferLine.preload({
            id,
            ...createLineOfferInput,
          });
          offer.total =
            ( parseInt(offer.total) + 
              parseInt(createLineOfferInput.total_price) -
              parseInt(lastTotal)).toString()
      
          offer.total_tax =
            ( parseInt(offer.total_tax) + 
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
        updateOrderOfferInput.status as OrderOfferStatuses ?? OrderOfferStatuses.PENDING_PRICE
      await offerOrder.save()
      if (updateOrderOfferInput.status === OrderOfferStatuses.CLOSED) {
        const preOrder = await offerOrder.preOrder;
        if (preOrder) {
          preOrder.status = PreOrderStatus.CLOSED;
          await preOrder.save(); 
        } else {
          throw new Error('PreOrder not found for this OfferOrder');
        }
      }
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
