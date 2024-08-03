import { Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, IsNull } from "typeorm";
import { User } from 'src/users/user/entities/user.entity';
import { LineDTO } from './dto/lineDTO';
import { Line } from './entities/order-line.entity';
import { PreOrder } from '../preOrder/entities/pre-order.entity';
import { PreOrderStatus } from '../enums/pre-order-states.enum';
import { UpdateLineInput } from './dto/update-line-order.input';
import { CreateLineInput } from './dto/create-line-order.input';
import { IndexLineInput } from './dto/index-line.input';
import { PaginationLineResponse } from './dto/pagination-lines.responde';


@Injectable()
export class PreOrderLineService {
  constructor( 
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectDataSource() private readonly dataSource: DataSource)
     
     { }

     async createline(createLineInput: CreateLineInput,user:User): Promise<PreOrder> {
       
       try {
        const line: Line = Line.create<Line>(createLineInput);
        line.userId = user.id
        await line.save();

        const result =  await PreOrder.findOne({
          where: { id: createLineInput.preOrderId},
          relations: ["files","lines"],
        })
        if (result.status = PreOrderStatus.PENDING_INFO) {
          result.status = PreOrderStatus.PENDING_PRODUCT
          await result.save()
        }
        return result
        
      } catch (error) {

        console.log('create_line_order err',error)
        
      }
    
     }
     async orderlines(indexLineInput: IndexLineInput) {
      indexLineInput?.boot();
       const { take, skip } = indexLineInput || {};
       const whereConditions = {}
       whereConditions['deleted_at'] = IsNull()
       const [data, total] = await Line.findAndCount({
        skip,
        take,
        relations: ['preOrder'],
        where : whereConditions,
        order: {
          id: 'DESC'
        },
      });
    
      const lineDto: LineDTO[] = await Promise.all(data.map(async (line) => {
        const preOrder = await line.preOrder;
        const project = await preOrder.project;
        return {
          id: line.id,
          pre_order_id: preOrder.id,
          pre_order_uuid: preOrder.uuid,
          project_name: project.name,
          expert_name: preOrder.expert_name,
          applicant_name: preOrder.applicant_name,
          need_date: preOrder.need_date,
          item_name: line.item_name,
          attribuite: line.attribuite,
          uom: line.uom,
          brand: line.brand,
          qty: line.qty,
          descriptions: line.descriptions,
          type: line.type,
          created_at: line.created_at,
        } as LineDTO;
      }));
    
      return PaginationLineResponse.make(indexLineInput, total, lineDto);
    }
    
    async updateline(id:number,updateLineInput: UpdateLineInput,user:User): Promise<PreOrder> {
       
    try {
  
      const line: Line = await Line.preload({
        id,
        ...updateLineInput,
      });
      line.userId = user.id
      await line.save();

       const result =  await PreOrder.findOne({
         where: { id: line.preOrderId},
         relations: ["files","lines"],
       })

       return result
       
    } catch (error) {

       console.log('update_line_order err',error)
       
    }
   
   }
    async removeline(id: number,user:User): Promise<boolean> {
       
      try {
        const line = await Line.findOneBy({
         id
        })
        
        if (line) {
          line.deleted_at = new Date().toLocaleString()
          await line.save()
        }
       
       return true
      
     } catch (error) {

       console.log('create_line_order err',error)
       return false
     }
   
   }

    
}
