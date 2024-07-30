import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { AuthorizationService } from "src/users/authorization/authorization.service";
import { User } from 'src/users/user/entities/user.entity';
import { DataSource, Like } from "typeorm";
import { PreOrderStatus } from '../enums/pre-order-states.enum';
import { CreatePreOrderInput } from './dto/create-pre-order.input';
import { IndexPreOrderInput } from './dto/index-preOrder.input';
import { PaginationPreOrderResponse } from "./dto/pagination-preOrder.responde";
import { UpdatePreOrderInput } from './dto/update-pre-order.input';
import { PreOrder } from './entities/pre-order.entity';
import { Not, IsNull,In } from "typeorm"
import { ExpireTypes } from "./enum/expire-types.enum";
import { OfferOrder } from "../orderOffer/entities/order-offer.entity";
import { TypeOrderOffer } from "../enums/type-order-offer.enum";
import { TypeOrder } from "./enum/type-order.enum";
import { OrderOfferStatuses } from "../orderOffer/enums/order-offer-statuses";
import { Offer } from "src/products/offer/entities/offer.entity";
import { Project } from "src/users/project/entities/project.entity";
import { TypeProject } from "src/users/project/enums/type-project.enum";
import { UserProject } from "src/users/project/entities/user-project.entity";
import { PaymentResponse } from "./dto/payment.responde";
import { IndexPublicOrderInput } from "./dto/index-public-order.input";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { PublicPreOrderDTO } from "./dto/publicPreOrderDTO";
import { PreOrderDTO } from "./dto/preOrderDTO";
import { DecompressionService } from "src/decompression.service";
import { CompressionService } from "src/compression.service";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { File } from "src/base/storage/file/entities/file.entity";
import { ProjectAddress } from "src/users/project/entities/addressProject.entity";

@Injectable()
export class PreOrderService {
  constructor( 
    private authorizationService: AuthorizationService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,)
     { }
  async generateNumericUuid(length: number = 5): Promise<string> {
      const min = Math.pow(10, length - 1);
      const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }
  async createPreOrder(createPreOrderInput: CreatePreOrderInput, user: User): Promise<PreOrder> {
    try {
      console.log('inpuut',createPreOrderInput )
        const currentDateTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Tehran" });
        const [project, projectAddress] = await Promise.all([
          Project.findOneBy({ id: createPreOrderInput.projectId }),
          ProjectAddress.findOneBy({ id: createPreOrderInput.addressId }),
        ]);
      
        console.log('jjj',project,createPreOrderInput.projectId )

        let order = await PreOrder.findOneBy({
            userId: user.id,
            status: PreOrderStatus.PENDING_INFO
        });

        const updateOrderDetails = (order: PreOrder, input: CreatePreOrderInput, projectType: TypeProject, currentDateTime: string) => {
            Object.assign(order, {
                applicant_name: input.applicant_name,
                addressId: input.addressId,
                categoryId: input.categoryId,
                expert_name: input.expert_name,
                descriptions: input.descriptions,
                bid_start: input.bid_start,
                bid_end: input.bid_end,
                projectId: input.projectId,
                payment_methods: input.payment_methods,
                type: projectType === TypeProject.REAL ? TypeOrder.REAL : TypeOrder.LEGAL,
                request_date: currentDateTime,
                expire_time: currentDateTime,
            });
        };

        if (order) {
          updateOrderDetails(order, createPreOrderInput, project.type, currentDateTime);
            if (createPreOrderInput.projectId) {
              order.project = Promise.resolve(project)  
            }
            if (createPreOrderInput.projectId) {
              order.address = Promise.resolve(projectAddress)
            }
            console.log('create order',order )
            await order.save();
            return order;
        }

        order = PreOrder.create<PreOrder>(createPreOrderInput);
        order.uuid = await this.generateNumericUuid();
        order.request_date = currentDateTime;
        order.expire_time = currentDateTime;
 
      
        let userId = user.id;
        if (createPreOrderInput.cellphone) {
            const userByCellphone = await User.findOneBy({ cellphone: createPreOrderInput.cellphone });
            if (!userByCellphone) {
                throw new Error('User not found');
            }
            userId = userByCellphone.id;
        }
        order.userId = userId;

        updateOrderDetails(order, createPreOrderInput, project.type, currentDateTime);
        order.project = Promise.resolve(project)  
        order.address = Promise.resolve(projectAddress)
        await order.save();
        return order;
    } catch (error) {
        console.error('createPreOrder error:', error);
        throw error;
    }
  }

  async pickUpPreOrder(preOrderId : number,user:User): Promise<PreOrder> {
    
    try {
      const order = await PreOrder.findOneBy({
        id : preOrderId,
      });
      if (order) {
        const new_offer = new OfferOrder()
        new_offer.preOrderId = order.id
        new_offer.userId = user.id
        await new_offer.save();

        return order
      }
      
      return 
    } catch (error) {

      console.log('create_pre_order err',error)
      
    }
  
  }
  async myPreOrder(indexPreOrderInput:IndexPreOrderInput,user:User): Promise<PaginationPreOrderResponse> {
    indexPreOrderInput?.boot();
    const {
      take,
      skip,
    } = indexPreOrderInput || {};
    try {
      const whereConditions = {}
      whereConditions['deleted_at'] = IsNull()
      whereConditions['offers'] = [
        { userId: user.id }
      ];
      const [data, total] = await PreOrder.findAndCount({
        skip,
        take,
        where: whereConditions,
        order: {
          id:'DESC'
        },
      });
  
      
      return PaginationPreOrderResponse.make(indexPreOrderInput,total,data)

    } catch (error) {

      console.log('myPreOrder err',error)
      
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
    const preOrder: PreOrder = await PreOrder.preload({
      id,
      ...updatePreOrderInput,
    });
    
    if (!preOrder) {
      return null; 
    }
  
    preOrder.request_date = new Date().toLocaleString("en-US", { timeZone: "Asia/Tehran" })
    if (updatePreOrderInput.need_date) {
      preOrder.need_date = updatePreOrderInput.need_date 
    }
    if (updatePreOrderInput.bid_start) {
      preOrder.bid_start = updatePreOrderInput.bid_start 
    }
    if (updatePreOrderInput.bid_end) {
      preOrder.bid_end = updatePreOrderInput.bid_end 
    }
    preOrder.expire_time = updatePreOrderInput.expire_date
      ? this.calculateExpirationDate(updatePreOrderInput.expire_date).toLocaleString("en-US", { timeZone: "Asia/Tehran" })
      : null
      ; 
    
    if (updatePreOrderInput.categoryId) {
      preOrder.categoryId = updatePreOrderInput.categoryId
    }
 
    if (updatePreOrderInput.applicant_name) {
     
      preOrder.applicant_name = updatePreOrderInput.applicant_name

    }

    if (updatePreOrderInput.expert_name) {
      preOrder.expert_name = updatePreOrderInput.expert_name

    }
  
    let preOrderAddress = await preOrder.address;
    let isHaveAddress = (preOrderAddress?.address?.length > 0) ?? false;
  

    const isHaveLines = preOrder.lines && (await preOrder.lines).length > 0;
   
    const isHaveOffers = preOrder.offers && preOrder.offers.length > 0;
  
    const updateCurrentStatusByCommingProps = {
      [PreOrderStatus.PENDING_INFO]: PreOrderStatus.PENDING_INFO,
      [PreOrderStatus.PENDING_PRODUCT]: isHaveAddress ? PreOrderStatus.PENDING_PRODUCT : PreOrderStatus.PENDING_INFO,
      [PreOrderStatus.PENDING_OFFER]: isHaveLines && isHaveAddress ? PreOrderStatus.PENDING_OFFER : PreOrderStatus.PENDING_PRODUCT,
      [PreOrderStatus.COMPLETED]: isHaveOffers ? PreOrderStatus.COMPLETED : PreOrderStatus.PENDING_OFFER,
      [PreOrderStatus.CLOSED]: PreOrderStatus.CLOSED,
    }
  
    preOrder.status = updateCurrentStatusByCommingProps[updatePreOrderInput.status ?? preOrder.status]
    if (preOrder.projectId) {
      const [project, projectAddress] = await Promise.all([
        Project.findOneBy({ id: updatePreOrderInput.projectId }),
        ProjectAddress.findOneBy({ id: updatePreOrderInput.addressId }),
      ]);
      
      const findType = project.type === TypeProject.REAL ? TypeOrder.REAL : TypeOrder.LEGAL;
      preOrder.project = Promise.resolve(project);
      preOrder.type = findType;
      preOrder.address = Promise.resolve(projectAddress); 
      console.log('hhh',project,preOrder.project)
    }
    console.log('update',preOrder,preOrder.project)

    await preOrder.save()
  
    return preOrder;
  }
  
  async removePreOrder( id: number,user:User): Promise<Boolean> {
    
    try {
     
      let preOrder = await PreOrder.findOneBy({
         id
      })
      if (preOrder) {
         preOrder.deleted_at = new Date().toLocaleString()
      }
      await preOrder.save()
      return true
      
    } catch (error) {

      console.log('remove remove Pre Order err',error)
      return false
      
    }   
  
  }
  async payment( id: number,user:User): Promise<PaymentResponse> {
    
    try {
      const offer = await OfferOrder.findOneBy({ id })
      const preOrder = await PreOrder.findOneBy({ id:offer.preOrderId })
      preOrder.status = PreOrderStatus.CLOSED
      offer.status = OrderOfferStatuses.CLOSED
      await preOrder.save()
      await offer.save()
      return {
          success: true,
          message: "پرداخت با موفقیت انجام شد",
          callbackUrl : `https://vardast.com/payment/order/${preOrder.uuid}`
      }
      
    } catch (error) {

      
    }   
  
  }
  async findPreOrderById(id : number,user:User,client:boolean): Promise<PreOrder> {
  
    try {
      let order = await PreOrder.findOne({
        where: { id: id },
        relations: ["files", "lines"],
        order: {
          lines: {
            type : 'ASC'
          }
        }
      })
      if (!order) {
        throw new Error('Order not found');
      }
     
      const offersPromises = Promise.all([
          OfferOrder.find({ 
            where: { preOrderId: order.id, type: TypeOrderOffer.CLIENT,status : Not(OrderOfferStatuses.PENDING_INFO) },
            relations: ["offerLine"],
            order: {
              offerLine: {
                line: {
                  type: 'ASC',
                  id: "DESC"
                }
              }
            }
          }),
          OfferOrder.find({ 
            where: { preOrderId: order.id, type: TypeOrderOffer.SELLER,status : Not(OrderOfferStatuses.PENDING_INFO) },
            relations: ["offerLine"],
            order: {
              offerLine: {
                line: {
                  type: 'ASC',
                  id: "DESC"
                }
               
              }
            }
          }),
          OfferOrder.find({ 
            where: { preOrderId: order.id, type: TypeOrderOffer.VARDAST , status : Not(OrderOfferStatuses.PENDING_INFO) },
            relations: ["offerLine"],
            order: {
              offerLine: {
                line: {
                  type: 'ASC',
                  id: "DESC"
                }
              }
            }
          }),
          OfferOrder.find({ 
            where: { preOrderId: order.id,status:OrderOfferStatuses.INVOICE },
            relations: ["offerLine"],
            order: {
              offerLine: {
                line: {
                  type: 'ASC',
                  id: "DESC"
                }
              }
            }
          }),
          OfferOrder.find({ 
            where: { preOrderId: order.id,type:TypeOrderOffer.CLIENT, total: Not('0') ,status : Not(OrderOfferStatuses.PENDING_INFO) },
            relations: ["offerLine"],
            order: {
              offerLine: {
                line: {
                  type: 'ASC',
                  id: "DESC"
                }
              }
            }
          }),
        ]);

      const [clientOffers, sellerOffers, adminOffers,clientInvoiceOffers,clientSelfOffers] = await offersPromises;
 

      const uniqueOffers = new Map();

      const addOffersToMap = (offers) => {
        offers.forEach(offer => {
          if (!uniqueOffers.has(offer.id)) {
            uniqueOffers.set(offer.id, offer);
          }
        });
      };
    
      if (client) {
        clientInvoiceOffers.forEach(offer => {
          offer.request_name = 'کارشناس وردست';
        });
        addOffersToMap(clientInvoiceOffers);
        addOffersToMap(clientSelfOffers);
      } else {
        addOffersToMap(clientOffers);
        addOffersToMap(sellerOffers);
        addOffersToMap(adminOffers);
      }
    
      order.offers = Array.from(uniqueOffers.values()).sort((a, b) => b.id - a.id);
   
      const edit_lines = await order.lines
      edit_lines.filter(line => line.deleted_at === null)
        .sort((a, b) => a.type.localeCompare(b.type)); 
      order.lines = Promise.resolve(edit_lines)
      return order
    } catch (error) {
 
      console.log('find one pre order err',error)
      
    }
  
  }
  async publicOrders(indexPublicOrderInput: IndexPublicOrderInput): Promise<PublicPreOrderDTO[]> {
    const { categoryId, number } = indexPublicOrderInput;
    const cacheKey = `publicOrders-${JSON.stringify(indexPublicOrderInput)}`;
  
    const cachedData = await this.cacheManager.get<PublicPreOrderDTO[]>(cacheKey);
    if (cachedData) {
       return cachedData;
    }
  
    let categories;
    if (categoryId) {
      const category = await Category.findOne({
        select: ['title', 'id','imageCategory'],
        where: { id: categoryId },
        relations: ['imageCategory']
      });
  
      if (!category) {
        throw new Error(`Category with ID ${categoryId} not found.`);
      }
  
      categories = [category];
    } else {
      categories = await Category.find({
        select: ['title', 'id','imageCategory'],
        where: { parentCategory: IsNull() },
        relations:['imageCategory']
      });
    }
  
    const publicPreOrderDTOs: PublicPreOrderDTO[] = [];
    const baseUrl = process.env.STORAGE_MINIO_URL || 'https://storage.vardast.ir/vardast/';
    const maxNumber = typeof number === 'number' ? Math.min(Math.max(number, 2), 15) : 2;
  
    await Promise.all(categories.map(async (category) => {
        const imageCategory = await category.imageCategory;
        const fileId = imageCategory[0].fileId;
  
        const [orders, image] = await Promise.all([
            PreOrder.find({
                select: ['id', 'uuid', 'request_date', 'need_date', 'bid_start', 'bid_end', 'lines', 'categoryId', 'category'],
                where: { categoryId: category.id,status:Not(PreOrderStatus.PENDING_INFO) },
                take: maxNumber,
                relations: ['lines'],
                order: {
                  id:'DESC'
                }
            }),
            File.findOneBy({ id: fileId })
        ]);
  
        if (orders.length >= 2) {
            const orderDTOs: PreOrderDTO[] = await Promise.all(
                orders.map(async (order) => ({
                    id: order.id,
                    uuid: order.uuid,
                    request_date: order.request_date,
                    destination: 'تهران',
                    payment_method : 'نقدی',
                    need_date: order.need_date,
                    bid_start: order.bid_start,
                    bid_end: order.bid_end,
                    lines: order.lines,
                    lineDetail: (await order.lines).map(line => line.item_name).join(' - ')
                }))
            );
  
            publicPreOrderDTOs.push({
                categoryName: category.title,
                orders: orderDTOs,
                categoryImage: `${baseUrl}${image.name}`,
                categoryId: category.id,
            });
        }
    }));
  
    await this.cacheManager.set(cacheKey, publicPreOrderDTOs, CacheTTL.SIX_HOURS);
    return publicPreOrderDTOs;
  }
  
  async paginate(user: User, indexPreOrderInput: IndexPreOrderInput, client: boolean, seller: boolean, isRealUserType: boolean): Promise<PaginationPreOrderResponse> {
    indexPreOrderInput?.boot();
    const { take, skip, projectId, customerName, hasFile, projectName, status } = indexPreOrderInput || {};
  
    const whereConditions: any = {};
    whereConditions['deleted_at'] = IsNull();
    whereConditions['status'] = Not(PreOrderStatus.PENDING_INFO);
    if (client) {
      const userProjects = await UserProject.find({
        where: {
          project :  {
            type : isRealUserType ? TypeProject.REAL : TypeProject.LEGAL
          },
          userId: user.id
        }
      });
  
      const userProjectIds = userProjects.map(data => data.projectId);

  
      whereConditions['projectId'] = In(userProjectIds);
      whereConditions['type'] = isRealUserType ? TypeOrder.REAL : TypeOrder.LEGAL;
    } else {
      if (projectId) {
        whereConditions['projectId'] = projectId;
      }
    }
  
    if (await this.authorizationService.setUser(user).hasRole("admin") && !client) {
      if (customerName) {
        whereConditions['user'] = [
          { firstName: Like(`%${customerName}%`) },
          { lastName: Like(`%${customerName}%`) }
        ];
      }
      if (projectName) {
        whereConditions['project'] = [
          { name: Like(`%${projectName}%`) }
        ];
      }
      if (seller) {
        whereConditions['status'] = PreOrderStatus.PENDING_OFFER;
        whereConditions['pickUpUserId'] = IsNull();
      } else {
        if (status) {
          whereConditions['status'] = status as PreOrderStatus;
        }
      }
    }
  
    if (hasFile) {
      whereConditions['files'] = {
        id: Not(IsNull()),
      };
    }
  
  
    const [data, total] = await PreOrder.findAndCount({
      skip,
      take,
      where: whereConditions,
      order: {
        id: 'DESC'
      },
    });
    if (client) {
        await Promise.all(
        data.map(async (pre_order) => {
          pre_order.lineDetail = (await pre_order.lines).map(line => line.item_name + ' - ').join('').slice(0, -3);
          const user = await pre_order.user;
          user.fullName = 'کارشناس وردست';
          return pre_order;
        })
      );
    }
    return PaginationPreOrderResponse.make(indexPreOrderInput, total, data);
  }
  
    
}
