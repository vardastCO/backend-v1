import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { AuthorizationService } from "src/users/authorization/authorization.service";
import { User } from 'src/users/user/entities/user.entity';
import { DataSource, Like } from "typeorm";
import { PreOrderStates } from '../enums/pre-order-states.enum';
import { CreatePreOrderInput } from './dto/create-pre-order.input';
import { IndexPreOrderInput } from './dto/index-preOrder.input';
import { PaginationPreOrderResponse } from "./dto/pagination-preOrder.responde";
import { UpdatePreOrderInput } from './dto/update-pre-order.input';
import { PreOrder } from './entities/pre-order.entity';
import { Not, IsNull } from "typeorm"
import { ExpireTypes } from "./enum/expire-types.enum";
import { OfferOrder } from "../orderOffer/entities/order-offer.entity";
import { TypeOrderOffer } from "../enums/type-order-offer.enum";

@Injectable()
export class PreOrderService {
  constructor( 
    private authorizationService: AuthorizationService,
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
  private calculateExpirationDate(expireTimeEnum: ExpireTypes): Date {
    const currentDate = new Date();
    switch (expireTimeEnum) {
      case ExpireTypes.ONE_DAY:
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case ExpireTypes.TWO_DAYS:
        currentDate.setDate(currentDate.getDate() + 2);
        break;
      case ExpireTypes.THREE_DAYS:
        currentDate.setDate(currentDate.getDate() + 3);
        break;
      default:
        // Default to one day if enum value is not recognized
        currentDate.setDate(currentDate.getDate() + 1);
        break;
    }
    return currentDate;
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
    things.request_date = new Date().toLocaleString("en-US", { timeZone: "Asia/Tehran" })
    things.expire_date = this.calculateExpirationDate(updatePreOrderInput.expire_date).toLocaleString("en-US", { timeZone: "Asia/Tehran" });
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
        const offersPromises = Promise.all([
          OfferOrder.find({ 
            where: { preOrderId: order.id, type: TypeOrderOffer.CLIENT },
            relations: ["offerLine"]
          }),
          OfferOrder.find({ 
            where: { preOrderId: order.id, type: TypeOrderOffer.SELLER },
            relations: ["offerLine"]
          }),
          OfferOrder.find({ 
            where: { preOrderId: order.id, type: TypeOrderOffer.VARDAST },
            relations: ["offerLine"]
          }),
        ]);
  
        // Wait for all offers to resolve
        const [clientOffers, sellerOffers, adminOffers] = await offersPromises;
  
        // Push offers into the order's offers array
        order.offers = [...clientOffers, ...sellerOffers, ...adminOffers];
        return order
      }

      return 
    } catch (error) {

      console.log('create_pre_order err',error)
      
    }
  
  }
   
  async paginate(user: User, indexPreOrderInput: IndexPreOrderInput): Promise<PaginationPreOrderResponse> {
    indexPreOrderInput?.boot();
    const {
      take,
      skip,
      projectId,
      customerName,
      hasFile,
      projectName,
      status
     } = indexPreOrderInput || {};

    const whereConditions = {}

    if (projectId) {
      whereConditions['projectId'] = projectId;
    }

    if (!(await this.authorizationService.setUser(user).hasRole("admin"))) {
      whereConditions['userId'] = user.id;
    } 

  
    if (await this.authorizationService.setUser(user).hasRole("admin")) {
      if (customerName) {
        whereConditions['user'] =  [
          { firstName: Like(`%${customerName}%`) },
          { lastName: Like(`%${customerName}%`) }
        ];
      }
      if (projectName) {
        whereConditions['project'] =  [
          { name: Like(`%${projectName}%`) }
        ];;
      }

      if (status) {
        whereConditions['status'] = status as PreOrderStates;
      }
    }
    if (hasFile) {
      whereConditions['files'] = {
        id: Not(IsNull()),
      };
    } else {
      whereConditions['files'] = null;
    }

    const [data, total] = await PreOrder.findAndCount({
      skip,
      take,
      where: whereConditions,
      order: {
        id:'DESC'
      },
    });

    
    return PaginationPreOrderResponse.make(indexPreOrderInput,total,data)
  }
    
}
