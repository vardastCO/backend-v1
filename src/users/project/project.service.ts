import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { I18n, I18nService } from "nestjs-i18n";
import { In, Like, MoreThan } from 'typeorm';
import { User } from "../user/entities/user.entity";
import { CreateAddressProjectInput } from "./dto/create-address-project.input";
import { CreateProjectInput } from "./dto/create-project.input";
import { CreateUserProjectInput } from "./dto/create-user-project.input";
import { IndexProjectInput } from "./dto/index-project.input";
import { PaginationProjectResponse } from "./dto/pagination-project.response";
import { UpdateProjectAddressInput } from "./dto/update-address-input";
import { UpdateProjectInput } from "./dto/update-project-input";
import { UpdateProjectUserInput } from "./dto/update-user-input";
import { ProjectAddress } from "./entities/addressProject.entity";
import { Project } from "./entities/project.entity";
import { ProjectHasAddress } from "./entities/projectHasAddress.entity";
import { UserProject } from "./entities/user-project.entity";
import { UserTypeProject } from "./enums/type-user-project.enum";
import { TypeProject } from "./enums/type-project.enum";
@Injectable()
export class ProjectService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @I18n() protected readonly i18n: I18nService,
  ) { }
  
  async generateNumericUuid(length: number = 10): Promise<string> {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }
  async create(createProjectInput: CreateProjectInput,userId:number): Promise<Project> {
    try {
      const project: Project = Project.create<Project>(createProjectInput);
      project.uuid = await this.generateNumericUuid()
      await project.save();
      let user_id = userId
      const userProject = new UserProject()
      if (createProjectInput.cellphone) {
        let findUserId = (await await User.findOneBy({ cellphone: createProjectInput.cellphone })).id
        if (!findUserId) {
          throw new BadRequestException(
            (await this.i18n.translate("exceptions.NOT_FOUND_USER")),
          );
        }
        user_id = findUserId
      }
      userProject.userId = user_id
      userProject.projectId = await project.id
      userProject.type = UserTypeProject.MANAGER
      await userProject.save();
      return project;

    } catch(e) {
      console.log('create project',e)
    }
   
  }
  async assignAddressProject(createAddressProjectInput:CreateAddressProjectInput,projectId:number,user:User): Promise<Project> {
    try {
      const address: ProjectAddress = ProjectAddress.create<ProjectAddress>(createAddressProjectInput);
      address.userId = user.id
      await address.save();

      const projectHasAddress = new ProjectHasAddress()
      projectHasAddress.projectId = projectId
      projectHasAddress.addressId = await address.id
      await projectHasAddress.save();
      await address.save();
      
      return await Project.findOne({
        where: { id: projectId },
        relations: ['user','address'],
      });
    }catch(e){
      console.log('create project',e)
    }
   
  }
  async assignUserProject(createUserProjectInput:CreateUserProjectInput,user:User): Promise<Project> {

    let findUser = await User.findOneBy({
      cellphone:createUserProjectInput.cellphone
    })
    if (findUser) {
      delete createUserProjectInput.cellphone

      const assign: UserProject = UserProject.create<UserProject>(createUserProjectInput);
      assign.userId = await findUser.id
      assign.name = ''
    
      await assign.save()
    } else {
      throw new BadRequestException(
          (await this.i18n.translate("exceptions.NOT_FOUND_USER")),
      );

    }
  
    return await Project.findOne({
      where: { id: createUserProjectInput.projectId },
      relations: ['user','address'],
    });

   
  }
  async removeUserProject(projectId:number,userId:number): Promise<Project> {
    try {
      let userProject=  await UserProject.findOne({
          where: { userId,projectId },
      });
     
      if (userProject) {
        await userProject.remove();
      }

      return await Project.findOne({
        where: { id: projectId },
        relations: ['user','address'],
      }); 
    }catch(e){
      console.log('create project',e)
    }
   
  }
  async removeAddressProject(projectId:number,addressId:number): Promise<Project> {
    try {
      const projecAddress =  await ProjectHasAddress.findOne({
          where: { projectId,addressId},
        });
  
      if (projecAddress) {
        await projecAddress.remove();
      }

      return await Project.findOne({
        where: { id: projectId },
        relations: ['user','address'],
      }); 
    }catch(e){
      console.log('create project',e)
    }
   
  }
  // async  updateProjectAdress(params:type) {
  //   const things: Brand = await Brand.preload({
  //     id,
  //     ...updateBrandInput,
  //   });
  //   if (!things) {
  //     throw new NotFoundException();
  //   }
  
  //   await things.save();
  //   await Project.findOne({
  //     where: { id: projectId },
  //     relations: ['userProjects','projectAddresses'],
  //   }); 
  // }
  
  
  // async paginate(
  //   indexProjectInput?: IndexProjectInput,
  // ): Promise<PaginationProjectResponse> {
  //   indexProjectInput.boot();
  //   const cacheKey = `project_{index:${JSON.stringify(indexProjectInput)}}`;
    
  //   const cachedData = await this.cacheManager.get<string>(cacheKey);
  
  //   if (cachedData) {
 
  //     return this.decompressionService.decompressData(cachedData);
  //   }
  //   const { take, skip } = indexProjectInput || {};
  //   const [data, total] = await Project.findAndCount({
  //     skip,
  //     take,
  //     where: {},
  //     order: { id: "DESC" },
  //   });
  //   const response = this.compressionService
  //   .compressData(PaginationProjectResponse.make(indexProjectInput, total, data))
  //   await this.cacheManager.set(cacheKey,response,CacheTTL.ONE_DAY);
  //   return PaginationProjectResponse.make(indexProjectInput, total, data);

  // }
  async findOneProject(
    id?: number,
  ): Promise<Project> {
   
    return await Project.findOne({
      where: { id: id },
      relations: ['user','address'],
    });
  }

  async update(
    id: number,
    updateProjectInput: UpdateProjectInput): Promise<Project> {
  

    const project: Project = await Project.preload({
      id,
      ...updateProjectInput
    });

    await project.save()
    return project;
  }


  async updateAddress(
    updateProjectAddressInput: UpdateProjectAddressInput
  ): Promise<Project> {
    let projectAddress: ProjectHasAddress = await ProjectHasAddress.findOneBy({
      addressId: updateProjectAddressInput.addressId,
      projectId : updateProjectAddressInput.projectId
    })

    if (!projectAddress) throw new NotFoundException();

    const result: ProjectAddress = await ProjectAddress.preload({
      id: updateProjectAddressInput.addressId,
      ...updateProjectAddressInput
    });
    await result.save();
   
    const project: Project = await Project.findOneBy({id: updateProjectAddressInput.projectId})
    return project;
  }

  async updateUser(
    updateProjectUserInput: UpdateProjectUserInput
  ): Promise<Project> {
    let userProject: UserProject = await UserProject.findOneBy({
      userId: updateProjectUserInput.userId,
      projectId: updateProjectUserInput.projectId
    })
   
    if (!userProject) {
      throw new BadRequestException(
        (await this.i18n.translate("exceptions.NOT_FOUND_USER")),
    );
    };
    const user = await User.findOneBy({
      cellphone: updateProjectUserInput.cellphone
    })
    if (!user) {
      throw new BadRequestException(
        (await this.i18n.translate("exceptions.NOT_FOUND_USER")),
    );
    };
    updateProjectUserInput.userId = user.id
    const res: UserProject = await UserProject.preload({
      id: userProject.id,
      ...updateProjectUserInput
    });

    await res.save();
    
    
    const projectId: number = userProject.projectId;

    const project: Project = await Project.findOneBy({ id: projectId })

    return project;
  }

  async myProjects(
    userId?: number,
    isRealUserType?: boolean
  ): Promise<Project[]> {
    const all = await Project.find({
      where: { user: { userId: userId } },
      relations: ['user', 'address'],
      order: {
        id: 'DESC'
      }
    });
    const ids = all.map(item => item.id);
    return await Project.find({
      where: { id: In(ids), type:isRealUserType ? TypeProject.REAL : TypeProject.LEGAL },
      relations: ['user', 'address'],
      order: {
        id: 'DESC'
      }
    })
  
  }


  async paginate(
    indexProjectInput?: IndexProjectInput,
  ): Promise<PaginationProjectResponse> {
    indexProjectInput.boot()
    const { take, skip, createTime,nameOrUuid,nameManager,nameEmployer , status} = indexProjectInput || {};
    const whereConditions: any = {};

    if (createTime) {
      whereConditions['createTime'] = MoreThan(createTime); 
    }
    if (nameOrUuid) {
      whereConditions['name'] =  Like(`%${nameOrUuid}%`)

    }
    if (status) {
      whereConditions['status'] = status;
    }
    if (nameManager) {
      
      whereConditions['user'] = {
        user :  {
          firstName : Like(`%${nameManager}%`)
        },
        type : UserTypeProject.MANAGER
      }
    }
    if (nameEmployer) {
      whereConditions['user'] = {
        user :  {
          firstName : Like(`%${nameEmployer}%`)
        },
        type : UserTypeProject.EMPLOYER
      }
    }
    const [data, total] = await Project.findAndCount({
      where:whereConditions ,
      take,
      skip,
    });

    return PaginationProjectResponse.make(indexProjectInput, total, data);
  
  }

  async assignUserToProject(projectId: number,userId:number): Promise<boolean> {
    try{
      const userProject = new UserProject()
      userProject.userId = userId
      userProject.projectId = projectId
      await userProject.save();
      return true;
    }catch(e){
      return false
    }
   
  }


}
