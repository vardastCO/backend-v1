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
        whereConditions['user'] = whereConditions['user'] = [
          { firstName: Like(`%${customerName}%`) },
          { lastName: Like(`%${customerName}%`) }
        ];;
      }

      if (hasFile) {
        whereConditions['hasFile'] = true
      }

      if (status) {
        whereConditions['status'] = status as PreOrderStates;
      }
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
