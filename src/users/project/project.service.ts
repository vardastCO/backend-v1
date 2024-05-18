import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { User } from "../user/entities/user.entity";
import { CreateAddressProjectInput } from "./dto/create-address-project.input";
import { CreateProjectInput } from "./dto/create-project.input";
import { CreateUserProjectInput } from "./dto/create-user-project.input";
import { UpdateProjectAddressInput } from "./dto/update-address-input";
import { UpdateProjectInput } from "./dto/update-project-input";
import { ProjectAddress } from "./entities/addressProject.entity";
import { Project } from "./entities/project.entity";
import { ProjectHasAddress } from "./entities/projectHasAddress.entity";
import { UserProject } from "./entities/user-project.entity";
import { UpdateProjectUserInput } from "./dto/update-user-input";
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
  async assignUserProject(createUserProjectInput:CreateUserProjectInput,user:User): Promise<Project> {
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
        where: { id: createUserProjectInput.projectId },
        relations: ['user','address'],
      });
    }catch(e){
      console.log('create project',e)
    }
   
  }
  async removeUserProject(id:number): Promise<Project> {
    try {
      const things =  await UserProject.findOne({
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
    id: number,
    updateProjectAddressInput: UpdateProjectAddressInput): Promise<Project> {
  
    const projectHasAddress: ProjectHasAddress = await ProjectHasAddress.findOneBy({
      id
    })
    if (!projectHasAddress) throw new NotFoundException();

    const projectAddressId: number = projectHasAddress.addressId;
    const projectAddress: ProjectAddress = await ProjectAddress.preload({
      id: projectAddressId,
      ...updateProjectAddressInput
    });
    await projectAddress.save();
    
    
    const projectId: number = projectHasAddress.projectId;
    const project: Project = await Project.findOneBy({id: projectId})
    return project;
  }

  async updateUser(
    id: number,
    updateProjectUserInput: UpdateProjectUserInput): Promise<Project> {
  
    const userProject: UserProject = await UserProject.findOneBy({
      id
    })
    if (!userProject) throw new NotFoundException();

    const projectUserId: number = await userProject.userId;

 
    const things: UserProject = await UserProject.preload({
      id: projectUserId,
      ...updateProjectUserInput
    });

    await things.save();
    
    
    const projectId: number = userProject.projectId;

    const project: Project = await Project.findOneBy({ id: projectId })

    return project;
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
