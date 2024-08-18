import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { I18n, I18nService } from "nestjs-i18n";
import { EntityManager, In, Like, MoreThan } from 'typeorm';
import { AuthorizationService } from "../authorization/authorization.service";
import { Legal } from "../legal/entities/legal.entity";
import { Member } from "../member/entities/members.entity";
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
// import { TypeProject } from "./enums/type-project.enum";
@Injectable()
export class ProjectService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @I18n() protected readonly i18n: I18nService,
    private authorizationService: AuthorizationService,
    private readonly entityManager: EntityManager
  ) { }
  
  async generateNumericUuid(length: number = 5): Promise<string> {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  async create(createProjectInput: CreateProjectInput,user:User,isRealUserType:boolean): Promise<Project> {
    try {
      const project: Project = Project.create<Project>(createProjectInput);
      project.uuid = await this.generateNumericUuid()
      project.legalId = createProjectInput.legalId

      if (await this.authorizationService.setUser(user).hasRole("admin")) {
        project.wallet = createProjectInput.wallet
        project.status = createProjectInput.status
      }

      await project.save();
 
      const userProject = new UserProject()
      
      const findOwnerId = (await (await await Legal.findOneBy({ id: createProjectInput.legalId })).owner).id
      if (!findOwnerId) {
        throw new BadRequestException(
          (await this.i18n.translate("exceptions.NOT_FOUND_USER")),
        );
      }

      userProject.userId = findOwnerId
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

      const projectHasAddress = new ProjectHasAddress()
      projectHasAddress.projectId = projectId
      projectHasAddress.addressId = await createAddressProjectInput.addressId
      await projectHasAddress.save();
      
      return await Project.findOne({
        where: { id: projectId },
        relations: ['users','addresses','legal'],
      });
    }catch(e){
      console.log('assignAddressProject project',e)
    }
   
  }

  async assignUserProject(createUserProjectInput:CreateUserProjectInput,user:User): Promise<Project> {

    const member: Member = await (await Member.findOneBy({id:createUserProjectInput.memberId}))
    if (!member) {
      throw new BadRequestException(
        (await this.i18n.translate("exceptions.NOT_FOUND_USER")),
      );
    }

    const projectUserExists = await UserProject.findOne({
      where: {
        userId: member.userId,
        projectId: createUserProjectInput.projectId
      }
    })

    if (projectUserExists) {
      throw new BadRequestException(
        (await this.i18n.translate("exceptions.MEMBER_EXISTS_IN_PROJECT"))
      )
    }

    const assign = new UserProject()
    assign.userId = member.userId
    assign.projectId = createUserProjectInput.projectId
    assign.name = (await member.user).fullName
    assign.wallet = createUserProjectInput.wallet ?? '0'
    assign.type = createUserProjectInput.type ?? UserTypeProject.EMPLOYER
    await assign.save()
  
    return await Project.findOne({
      where: { id: createUserProjectInput.projectId },
      relations: ['users','addresses'],
    });
  }

  async removeUserProject(projectId:number,userId:number): Promise<Project> {
    try {
      const userProject: UserProject=  await UserProject.findOne({
          where: { userId,projectId },
      });


      if (!userProject) {
        throw new BadRequestException(
          (await this.i18n.translate("exceptions.NOT_FOUND_USER")),
        );
      }


      if (userProject.type == UserTypeProject.MANAGER) {
        throw new BadRequestException(
          (await this.i18n.translate("exceptions.PROJECT_USER_IS_MANAGER"))
        )
      }
  
      if (userProject) {
        await userProject.remove();
      }

      return await Project.findOne({
        where: { id: projectId },
        relations: ['users','addresses'],
      }); 
    }catch(e){
      console.log('removeUserProject project',e)
    }
   
  }

  async removeAddressProject(projectId:number,addressId:number): Promise<Project> {
    try {
      const projecAddress =  await ProjectHasAddress.findOne({
          where: { projectId,addressId},
      });
      if (!projecAddress) {
        throw new BadRequestException(
          (await this.i18n.translate("exceptions.NOT_FOUND_USER")),
        );
      }
      if (projecAddress) {
        await projecAddress.remove();
      }

      return await Project.findOne({
        where: { id: projectId },
        relations: ['users','addresses'],
      }); 
    }catch(e){
      console.log('removeAddressProject project',e)
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
      relations: ['users','addresses','legal'],
    });
  }

  async update(
    id: number,
    updateProjectInput: UpdateProjectInput): Promise<Project> {
  
    if (!this.authorizationService.hasRole('admin')) {
      delete updateProjectInput.legalId
      delete updateProjectInput.wallet
      delete updateProjectInput.status
    }
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
    res.type = updateProjectUserInput.type ?? UserTypeProject.EMPLOYER
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
      where: { users: { userId: userId } },
      relations: ['user', 'address'],
      order: {
        id: 'DESC'
      }
    });
    const ids = all.map(item => item.id);
    return await Project.find({
      where: { id: In(ids) },
      relations: ['user', 'address'],
      order: {
        id: 'DESC'
      }
    })
  
  }


  async paginate(
    indexProjectInput?: IndexProjectInput,
    client?: boolean,
    user?: User,
    isRealUserType?:boolean
  ): Promise<PaginationProjectResponse> {
    indexProjectInput.boot()
    const { take, skip, createTime,nameOrUuid,nameManager,nameEmployer , status} = indexProjectInput || {};
    const whereConditions: any = {};

    if (client) {
      whereConditions['users'] = {
        user :  {
          id :user.id
        },
      }
      // whereConditions['type'] = isRealUserType ? TypeProject.REAL : TypeProject.LEGAL
    } else {
      if (createTime) {
        whereConditions['createTime'] = MoreThan(createTime); 
      }

      if (nameOrUuid) {
        whereConditions['name'] = Like(`%${nameOrUuid}%`);
      }

      if (status) {
        whereConditions['status'] = status;
      }
      
      let userProjecttIds = [];
      if (nameManager) {
         userProjecttIds = (await this.entityManager.query(
           ` SELECT user_project."id" 
             FROM users
             INNER JOIN user_project
             ON users."id" = user_project."userId"
             WHERE "firstName" like '%${nameManager}%' OR "lastName" like '%${nameManager}%'`
        )).map(user => user.id);

        whereConditions['users'] = {
          id: In(userProjecttIds),
          type : UserTypeProject.MANAGER
        }
      }


      if (nameEmployer) {
         userProjecttIds = (await this.entityManager.query(
           ` SELECT user_project."id" 
             FROM users
             INNER JOIN user_project
             ON users."id" = user_project."userId"
             WHERE "firstName" like '%${nameEmployer}%' OR "lastName" like '%${nameEmployer}%'`
        )).map(user => user.id);

        whereConditions['users'] = {
          id: In(userProjecttIds),
          type : UserTypeProject.EMPLOYER
        }
      }

    }

   
    const [data, total] = await Project.findAndCount({
      where:whereConditions ,
      take,
      skip,
      relations : ['users'],
      order: {id: "DESC" },
    });

    return PaginationProjectResponse.make(indexProjectInput, total, data);
  
  }

  async removeProject(id: number): Promise<boolean> {
       
    try {
      const project = await Project.findOneBy({
       id
      })
      
      if (project) {
        project.deleted_at = new Date().toLocaleString()
        await project.save()
      }
     
     return true
    
   } catch (error) {

     console.log('removeProject err',error)
     return false
   }
 
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
