import { ModuleRef } from "@nestjs/core";
import { Command, CommandRunner } from "nest-commander";
import { exit } from "process";
import AddressSeeder from "src/users/address/address.seed";
import PermissionSeeder from "src/users/authorization/permission/permission.seed";
import RoleSeeder from "src/users/authorization/role/role.seed";
import ContactInfoSeeder from "src/users/contact-info/contact-info.seed";
import DevUserSeeder from "../../users/user/dev-user.seed";
import AreaSeeder from "../location/area/area.seed";
import CitySeeder from "../location/city/city.seed";
import CountrySeeder from "../location/country/country.seed";
import ProvinceSeeder from "../location/province/province.seed";
import DirectorySeed from "../storage/directory/directory.seed";
import CategorySeeder from "../taxonomy/category/category.seed";
import { importSeed, loadFiles } from "./file.util";

@Command({ name: "db:seed", description: "Run database seeder classes." })
export class SeedCommand extends CommandRunner {
  private readonly logService = console;

  constructor(private moduleRef: ModuleRef) {
    super();
  }

  async run(passedParam: string[], options?: any): Promise<void> {
    const seedClasses = this.getSeedManualClasses();

    // seedClasses = seedClasses.filter(
    //     (seedFileObject) => args.seed === undefined || args.seed === seedFileObject.name,
    // );

    // Run seeds
    for (const seedClass of seedClasses) {
      this.logService.log(`Executing ${seedClass.name} Seeder`);
      try {
        const instance = await this.moduleRef.get(seedClass, { strict: false });
        await instance.run();
        this.logService.warn(`Seeder ${seedClass.name} executed`, seedClass);
      } catch (error) {
        this.logService.log(`Could not run the seed ${seedClass.name}!`, error);
      }
    }

    this.logService.info("Database seeded successfully.");
    exit(0);
  }

  private async getSeedAutoClasses(): Promise<any[]> {
    const seedFiles = loadFiles(["src/**/*.seed.{ts,js}"]);
    return await Promise.all(seedFiles.map(seedFile => importSeed(seedFile)));
  }

  private getSeedManualClasses(): any[] {
    return [
      // CountrySeeder,
      // ProvinceSeeder,
      // CitySeeder,
      // AreaSeeder,
      // RoleSeeder,
      // PermissionSeeder,
      // DevUserSeeder,

      // DirectorySeed,
      CategorySeeder,
      // AddressSeeder,
      // ContactInfoSeeder,
    ];
  }
}
