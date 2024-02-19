import { ValidationPipe } from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Permission } from "src/users/authorization/permission.decorator";
import { File } from "../file/entities/file.entity";
import { DirectoryService } from "./directory.service";
import { CreateDirectoryInput } from "./dto/create-directory.input";
import { IndexDirectoryInput } from "./dto/index-directory.input";
import { PaginationDirectoryResponse } from "./dto/pagination-directory.response";
import { UpdateDirectoryInput } from "./dto/update-directory.input";
import { Directory } from "./entities/directory.entity";

@Resolver(() => Directory)
export class DirectoryResolver {
  constructor(private readonly directoryService: DirectoryService) {}

  @Permission("gql.base.storage.directory.store")
  @Mutation(() => Directory)
  createDirectory(
    @Args("createDirectoryInput") createDirectoryInput: CreateDirectoryInput,
  ) {
    return this.directoryService.create(createDirectoryInput);
  }

  @Permission("gql.base.storage.directory.index")
  @Query(() => PaginationDirectoryResponse, { name: "directories" })
  findAll(
    @Args(
      "indexDirectoryInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexDirectoryInput?: IndexDirectoryInput,
  ) {
    return this.directoryService.paginate(indexDirectoryInput);
  }

  @Permission("gql.base.storage.directory.show")
  @Query(() => Directory, { name: "directory" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.directoryService.findOne(id);
  }

  @Permission("gql.base.storage.directory.update")
  @Mutation(() => Directory)
  updateDirectory(
    @Args("updateDirectoryInput") updateDirectoryInput: UpdateDirectoryInput,
  ) {
    return this.directoryService.update(
      updateDirectoryInput.id,
      updateDirectoryInput,
    );
  }

  @Permission("gql.base.storage.directory.destroy")
  @Mutation(() => Directory)
  removeDirectory(@Args("id", { type: () => Int }) id: number) {
    return this.directoryService.remove(id);
  }

  @ResolveField(() => [File])
  files(@Parent() directory: Directory): Promise<File[]> {
    return this.directoryService.getFilesOf(directory);
  }
}
