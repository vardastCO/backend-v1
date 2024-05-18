import {
  Args,
  Mutation,
  Query,
  Resolver
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

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Permission("gql.users.address.store")
  @Mutation(() => Project)
  createProject(
    @Args("createProjectInput") createProjectInput: CreateProjectInput,
    @CurrentUser() user: User,
  ) {
    return this.projectService.create(createProjectInput,user.id);
  }
  @Permission("gql.users.address.store")
  @Mutation(() => Project)
  assignAddressProject(
    @Args("createAddressProjectInput") createAddressProjectInput: CreateAddressProjectInput,
    @Args("projectId") projectId: number,
    @CurrentUser() user: User,
  ) {
    return this.projectService.assignAddressProject(createAddressProjectInput,projectId,user);
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
    @Args("id") id: number,
  ) {
    return this.projectService.removeUserProject(id);
  }
  @Permission("gql.users.address.store")
  @Mutation(() => Project)
  removeAddressProject(
    @Args("id") id: number,
  ) {
    return this.projectService.removeAddressProject(id);
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
    @CurrentUser() user: User,
  ) {
  
    return this.projectService.myProjects(user.id);
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
  @Mutation(() => Project)
  updateProjectAddress(
    @Args("updateProjectAddressInput") updateProjectAddressInput: UpdateProjectAddressInput
  ) {
    return this.projectService.updateAddress(
      updateProjectAddressInput.id,
      updateProjectAddressInput)
  }
  @Permission("gql.users.address.store")
  @Mutation(() => Project)
  updateProjectUser(
    @Args("updateProjectUserInput") updateProjectUserInput: UpdateProjectUserInput
  ) {
    return this.projectService.updateUser(
      updateProjectUserInput.id,
      updateProjectUserInput)
  }
}
