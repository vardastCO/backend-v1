import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateProjectInput } from "./dto/create-project.input";
import { Project } from "./entities/project.entity";
import { UserProject } from "./entities/user-project.entity";
import { IndexProjectInput } from "./dto/index-project.input";
import { PaginationProjectResponse } from "./dto/pagination-project.response";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { CreateAddressProjectInput } from "./dto/create-address-project.input";
import { ProjectAddress } from "./entities/addressProject.entity";
import { ProjectHasAddress } from "./entities/projectHasAddress.entity";
import { User } from "../user/entities/user.entity";
import { CreateUserProjectInput } from "./dto/create-user-project.input";
@Injectable()
export class ProjectService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  )  {}
  async create(createProjectInput: CreateProjectInput,userId:number): Promise<Project> {
    try {
      const project: Project = Project.create<Project>(createProjectInput);
      await project.save();
      const userProject = new UserProject()
      userProject.userId = userId
      userProject.projectId = await project.id
     
      await userProject.save();
      return project;
    }catch(e){
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
  async assignUserProject(createUserProjectInput:CreateUserProjectInput,projectId:number,user:User): Promise<Project> {
    try {
      const user = await User.findOneBy({
        cellphone:createUserProjectInput.cellphone
      })
      if (user) {
        delete createUserProjectInput.cellphone

        const things: UserProject = UserProject.create<UserProject>(createUserProjectInput);
        things.userId= await user.id
      
        await things.save()
      } else {
        throw 'not found user';

      }
    
      return await Project.findOne({
        where: { id: projectId },
        relations: ['user','address'],
      });
    }catch(e){
      console.log('create project',e)
    }
   
  }
  async removeAddressProject(id:number): Promise<Project> {
    try {
      const things =  await ProjectHasAddress.findOne({
        where: { id },
      });
      let projectId = await things.projectId
      if (things) {
        await things.remove();
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

  async myProjects(
    userId?: number,
  ): Promise<Project[]> {

    return  await Project.find({
      where: { user: { userId: userId } }, 
      relations: ['user', 'address'],
      order: {
        id:'DESC'
      }
    });
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
