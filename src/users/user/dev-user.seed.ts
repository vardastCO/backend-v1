import { Inject } from "@nestjs/common";
import { Role } from "../authorization/role/entities/role.entity";
import { CreateUserInput } from "./dto/create-user.input";
import { User } from "./entities/user.entity";
import { UserLanguagesEnum } from "./enums/user-languages.enum";
import { UserStatusesEnum } from "./enums/user-statuses.enum";
import { UserService } from "./user.service";

export default class DevUserSeeder {
  private readonly data = [
    {
      firstName: "ali",
      lastName: "semsarilar",
      cellphone: "09127964915",
      password: "Aa123456",
      mustChangePassword: false,
      language: UserLanguagesEnum.FARSI,
      timezone: "Asia/Tehran",
      countryId: 244,
      status: UserStatusesEnum.ACTIVE,
      displayRoleId: 0,
    },
    {
      firstName: "farbod",
      lastName: "nasiri",
      cellphone: "09124484707",
      password: "M89Og90p",
      mustChangePassword: false,
      language: UserLanguagesEnum.FARSI,
      timezone: "Asia/Tehran",
      countryId: 244,
      status: UserStatusesEnum.ACTIVE,
      displayRoleId: 0,
    },
    {
      firstName: "mahsa",
      lastName: "mahjoob",
      cellphone: "09353308409",
      password: "Mm123456",
      mustChangePassword: false,
      language: UserLanguagesEnum.FARSI,
      timezone: "Asia/Tehran",
      countryId: 244,
      status: UserStatusesEnum.ACTIVE,
      displayRoleId: 0,
    },
    {
      firstName: "morteza",
      lastName: "morteza",
      cellphone: "09113193375",
      password: "Mm123456",
      mustChangePassword: false,
      language: UserLanguagesEnum.FARSI,
      timezone: "Asia/Tehran",
      countryId: 244,
      status: UserStatusesEnum.ACTIVE,
      displayRoleId: 0,
    },
    {
      firstName: "hesam",
      lastName: "hesam",
      cellphone: "09382625211",
      password: "Hh123456",
      mustChangePassword: false,
      language: UserLanguagesEnum.FARSI,
      timezone: "Asia/Tehran",
      countryId: 244,
      status: UserStatusesEnum.ACTIVE,
      displayRoleId: 0,
    },
    {
      firstName: "rohan",
      lastName: "admin",
      cellphone: "09370059005",
      password: "Rr123456",
      mustChangePassword: false,
      language: UserLanguagesEnum.FARSI,
      timezone: "Asia/Tehran",
      countryId: 244,
      status: UserStatusesEnum.ACTIVE,
      displayRoleId: 0,
    },
  ];

  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  async run(): Promise<any> {
    const admin = await Role.findOneBy({ name: "admin" });
    const userRole = await Role.findOneBy({ name: "user" });

    for (const userData of this.data) {
      let user: User;
      const createUserInput = Object.assign(new CreateUserInput(), userData);
      createUserInput.displayRoleId = admin.id;
      user = await this.userService.findOneBy({
        username: createUserInput.cellphone,
      });
      if (!user) {
        user = await this.userService.create(createUserInput, new User());
      }
      user.roles = Promise.resolve([admin, userRole]);
      await user.save();
    }
  }
}
