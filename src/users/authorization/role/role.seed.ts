import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "./entities/role.entity";

export default class RoleSeeder {
  private readonly data: {
    name: string;
    displayName: string;
    description?: string;
    isActive: boolean;
  }[] = [
    {
      name: "user",
      displayName: "کاربر سامانه",
      description: "تمامی کاربران سامانه می‌بایست این دسترسی را داشته باشند",
      isActive: true,
    },
    {
      name: "seller",
      displayName: "فروشنده",
      description:
        "فروشندگان محصول، قابلیت ایجاد نظارت شده محصول و ثبت پیشنهاد و قیمت برای آن ها را دارند.",
      isActive: true,
    },
    {
      name: "admin",
      displayName: "مدیر سامانه",
      description: "بالاترین سطح دسترسی سامانه",
      isActive: true,
    },
    {
      name: "moderator",
      displayName: "سرپرست سامانه",
      description: "مشابه مدیر سامانه اما فاقد دسترسی بخش‌های فنی",
      isActive: true,
    },
    {
      name: "product_moderator",
      displayName: "کارشناس مدیریت کالا",
      description: "امکان ورود و بروزرسانی اطلاعات کالا‌ها",
      isActive: true,
    },
  ];

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async run(): Promise<any> {
    await this.roleRepository.upsert(this.data, {
      conflictPaths: ["name"],
      skipUpdateIfNoValuesChanged: true,
    });
  }
}
