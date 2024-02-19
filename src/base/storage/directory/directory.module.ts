import { Module } from "@nestjs/common";
import { DirectoryResolver } from "./directory.resolver";
import DirectorySeed from "./directory.seed";
import { DirectoryService } from "./directory.service";

@Module({
  providers: [DirectoryResolver, DirectoryService, DirectorySeed],
})
export class DirectoryModule {}
