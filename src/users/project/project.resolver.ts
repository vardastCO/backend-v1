import {
  Args,
  Mutation,
  Query,
  Resolver,
  Context
} from "@nestjs/graphql";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Permission } from "../authorization/permission.decorator";
import { User } from "../user/entities/user.entity";
import { CreateAddressProjectInput } from "./dto/create-address-project.input";
import { CreateProjectInput } from "./dto/create-project.input";
import { CreateUserProjectInput } from "./dto/create-user-project.input";
import { UpdateProjectAddressInput } from "./dto/update-address-input";
import { UpdateProjectInput } from "./dto/update-project-input";
import { Project } from "./entities/project.entity";
import { ProjectService } from "./project.service";
import { UpdateProjectUserInput } from "./dto/update-user-input";
import { IndexProjectInput } from "./dto/index-project.input";
import { PaginationProjectResponse } from "./dto/pagination-project.response";
import { ValidationPipe } from "@nestjs/common";
import { IsRealUserType } from "../auth/decorators/current-type.decorator";
import { ReferersEnum } from "src/referers.enum";
@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Permission("gql.users.address.store")
  @Mutation(() => Project)
  createProject(
    @Args("createProjectInput") createProjectInput: CreateProjectInput,
    @CurrentUser() user: User,
    @IsRealUserType() isRealUserType?: boolean,
  ) {
    return this.projectService.create(createProjectInput,user.id,isRealUserType);
  }
  @Permission("gql.users.address.store")
  @Mutation(() => Project)
  assignAddressProject(
    @Args("createAddressProjectInput") createAddressProjectInput: CreateAddressProjectInput,
    @CurrentUser() user: User,
  ) {
    return this.projectService.assignAddressProject
      (createAddressProjectInput, createAddressProjectInput.projectId, user);
  }
  @Permission("gql.users.address.store")
  @Mutation(() => Project)
  assignUserProject(
    @Args("createUserProjectInput") createUserProjectInput: CreateUserProjectInput,
    @CurrentUser() user: User,
  ) {
    return this.projectService.assignUserProject(createUserProjectInput,user);
  }
  @Permission("gql.users.address.store")
  @Mutation(() => Project)
  removeUserProject(
    @Args("projectId") projectId: number,
    @Args("userId") userId: number,
  ) {
    return this.projectService.removeUserProject(projectId,userId);
  }
  @Permission("gql.users.address.store")
  @Mutation(() => Project)
  removeAddressProject(
    @Args("projectId") projectId: number,
    @Args("addressId") addressId: number,
  ) {
    return this.projectService.removeAddressProject(projectId,addressId);
  }
  // @Permission("gql.users.address.store")
  // @Mutation(() => Project)
  // updateProjectAdress(
  //   @Args("createAddressProjectInput") createAddressProjectInput: CreateAddressProjectInput,
  //   @Args("id") id: number,
  //   @CurrentUser() currentUser: User,
  // ) {
  //   return this.projectService.updateProjectAdress(
  //     id,
  //     createAddressProjectInput,
  //     currentUser,
  //   );
  // }
  // @Permission("gql.users.address.store")
  // @Mutation(() => Boolean)
  // assignUserToProject(
  //   @Args("projectId") projectId: number,
  //   @Args("userId") userId: number,
  // ) {
  //   return this.projectService.assignUserToProject(projectId,userId);
  // }
  @Permission("gql.users.address.store")
  @Query(() => Project, { name: "findOneProject" })
  findOneProject(
    @Args("id") id: number,
  ) {
    return this.projectService.findOneProject(id);
  }
  @Permission("gql.users.address.store")
  @Query(() => [Project], { name: "myProjects" })
  myProjects(
    @IsRealUserType() isRealUserType: boolean,
    @CurrentUser() user: User,
  ) {
  
    return this.projectService.myProjects(user.id,isRealUserType);
  }

  @Permission("gql.users.address.store")
  @Mutation(() => Project)
  updateProject(
    @Args("updateProjectInput") updateProjectInput: UpdateProjectInput
  ) {
    return this.projectService.update(updateProjectInput.id,
      updateProjectInput)
  }

  @Permission("gql.users.address.store")
  @Query(() => PaginationProjectResponse, { name: "projects" })
  Projects(
    @Args(
      "indexProjectInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexProjectInput?: IndexProjectInput,
    @Context() context?: { req: Request },
    @CurrentUser() user?: User,
    @IsRealUserType() isRealUserType?: boolean,
  )
  {
    const request = context?.req;
    const referer = request.headers['origin'] ?? null;
    const client = [ReferersEnum.CLIENT_VARDAST_IR, ReferersEnum.VARDAST_COM].includes(referer);
    
    return this.projectService.paginate(indexProjectInput,client,user,isRealUserType)
  }

  @Permission("gql.users.address.store")
  @Mutation(() => Project)
  updateProjectAddress(
    @Args("updateProjectAddressInput") updateProjectAddressInput: UpdateProjectAddressInput
  ) {
    return this.projectService.updateAddress(
      updateProjectAddressInput
    )
  }
  @Permission("gql.users.address.store")
  @Mutation(() => Project)
  updateProjectUser(
    @Args("updateProjectUserInput") updateProjectUserInput: UpdateProjectUserInput
  ) {
    return this.projectService.updateUser(
      updateProjectUserInput
    )
  }
}
