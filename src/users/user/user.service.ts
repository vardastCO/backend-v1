import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { Country } from "src/base/location/country/entities/country.entity";
import { File } from "src/base/storage/file/entities/file.entity";
import { FileService } from "src/base/storage/file/file.service";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { Seller } from "src/products/seller/entities/seller.entity";
import { SellerRepresentativeRoles } from "src/products/seller/enums/seller-representative-roles.enum";
import { DataSource, In, Repository } from "typeorm";
import { KavenegarService } from "../../base/kavenegar/kavenegar.service";
import { CountryService } from "../../base/location/country/country.service";
import { Permission } from "../authorization/permission/entities/permission.entity";
import { Role } from "../authorization/role/entities/role.entity";
import { CreateUserInput } from "./dto/create-user.input";
import { IndexUserInput } from "./dto/index-user.input";
import { PaginationUserResponse } from "./dto/pagination-user.response";
import { UpdateUserInput } from "./dto/update-user.input";
import { User } from "./entities/user.entity";
import { UserStatusesEnum } from "./enums/user-statuses.enum";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly countryService: CountryService,
    private readonly fileService: FileService,
    @Inject(DataSource) private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private kavenegarService: KavenegarService,
  ) {}

  async create(
    createUserInput: CreateUserInput,
    currentUser: User,
  ): Promise<User> {
    const user: User = User.create(
      await createUserInput.prepare(this.dataSource),
    );

    if (createUserInput.avatarUuid) {
      const file = await this.fileService.getNewlyUploadedFileOrFail(
        "user/user/avatars",
        createUserInput.avatarUuid,
        User.name,
        currentUser.id,
      );

      user.avatarFile = Promise.resolve(file);

      delete createUserInput.avatarUuid;
    }

    if (createUserInput.roleIds) {
      const roles = await Role.findBy({ id: In(createUserInput.roleIds) });
      if (roles.length != createUserInput.roleIds.length) {
        throw new BadRequestException("Some roles are invalid.");
      }
      user.roles = Promise.resolve(roles);
    }

    if (createUserInput.permissionIds) {
      const permissions = await Permission.findBy({
        id: In(createUserInput.permissionIds),
      });
      if (permissions.length != createUserInput.permissionIds.length) {
        throw new BadRequestException("Some permissions are invalid.");
      }
      user.permissions = Promise.resolve(permissions);
    }

    await user.save();
    return user;
  }

  async findAll(indexUserInput?: IndexUserInput): Promise<User[]> {
    const { take, skip, status, displayRoleId } = indexUserInput || {};
    return await this.userRepository.find({
      skip,
      take,
      where: { status, displayRoleId },
      order: { createdAt: "DESC", id: "DESC" },
    });
  }

  async userCount(): Promise<number> {
    const userCount: number = await User.count();
    return userCount;
  }

  async paginate(
    indexUserInput?: IndexUserInput,
  ): Promise<PaginationUserResponse> {
    indexUserInput.boot();
    const { take, skip, status, displayRoleId } = indexUserInput || {};
    const [data, total] = await User.findAndCount({
      skip,
      take,
      where: { status, displayRoleId },
      order: { createdAt: "DESC", id: "DESC" },
    });

    return PaginationUserResponse.make(indexUserInput, total, data);
  }

  async findOne(id: number, uuid?: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id, uuid });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async update(
    id: number,
    updateUserInput: UpdateUserInput,
    currentUser: User,
  ): Promise<User> {
    const user: User = await User.findOneBy({ id });

    if (!user) {
      throw new NotFoundException();
    }

    const originalUser = { ...user };

    Object.assign(user, updateUserInput);

    const shouldWeChangeAvatar = !!updateUserInput.avatarUuid;
    const oldAvatar: File = originalUser.avatarFileId
      ? await originalUser.avatarFile
      : null;
    let newAvatar: File;

    if (shouldWeChangeAvatar) {
      newAvatar = await this.fileService.getNewlyUploadedFileOrFail(
        "user/user/avatars",
        updateUserInput.avatarUuid,
        User.name,
        currentUser.id,
      );

      user.avatarFile = Promise.resolve(newAvatar);
    }

    if (updateUserInput.roleIds) {
      const roles = await Role.findBy({ id: In(updateUserInput.roleIds) });
      if (roles.length != updateUserInput.roleIds.length) {
        throw new BadRequestException("Some roles are invalid.");
      }
      user.roles = Promise.resolve(roles);
    }

    if (updateUserInput.permissionIds) {
      const permissions = await Permission.findBy({
        id: In(updateUserInput.permissionIds),
      });
      if (permissions.length != updateUserInput.permissionIds.length) {
        throw new BadRequestException("Some permissions are invalid.");
      }
      user.permissions = Promise.resolve(permissions);
    }

    if (
      updateUserInput.status == UserStatusesEnum.ACTIVE &&
      originalUser.status == UserStatusesEnum.NOT_ACTIVATED
    ) {
      await this.kavenegarService.lookup(
        user.cellphone,
        "accountActivated",
        "کاربر",
      );
    }

    this.dataSource.transaction(async () => {
      await user.save({ transaction: false });
      if (shouldWeChangeAvatar) {
        await File.update(newAvatar.id, { modelId: user.id });
        oldAvatar
          ? await this.fileService.removeFromStorageAndDB(oldAvatar)
          : null;
      }
    });

    if (updateUserInput.roleIds) {
      await this.cacheRolesOf(user);
      await this.cachePermissionsOf(user);
    } else if (updateUserInput.permissionIds) {
      await this.cachePermissionsOf(user);
    }

    return user;
  }

  async remove(id: number): Promise<User> {
    const user: User = await this.findOne(id);
    await this.userRepository.remove(user);
    user.id = id;
    return user;
  }

  async findOneBy(constraints: {
    username?: string;
    uuid?: string;
  }): Promise<User | null> {
    return await this.userRepository.findOneBy(constraints);
  }

  getCountry(user: User): Promise<Country> {
    return this.countryService.findOne(user.countryId);
  }

  async getRoles(user: User): Promise<Role[]> {
    return await user.roles;
  }

  async getPermissions(user: User): Promise<Permission[]> {
    return await user.permissions;
  }

  async cacheRolesOf(user: User): Promise<string[]> {
    const roleNames = (await user.roles).map(role => role.name);
    // this.cacheManager.set(
    //   user.getRoleCacheKey(),
    //   roleNames,
    //   CacheTTL.ONE_MONTH,
    // );
    return roleNames;
  }

  async cachePermissionsOf(user: User): Promise<string[]> {
    const userWholePermissions = await user.wholePermissionNames();
    // this.cacheManager.set(
    //   user.getPermissionCacheKey(),
    //   userWholePermissions,
    //   CacheTTL.ONE_MONTH,
    // );
    return userWholePermissions;
  }

  async getSellerRecordOf(user: User): Promise<Seller> {
    return await Seller.createQueryBuilder()
      .where(
        'id = (select "sellerId" from product_seller_representatives where "userId" = :userId and role = :role order by id asc limit 1)',
        {
          userId: user.id,
          role: SellerRepresentativeRoles.ADMIN,
        },
      )
      .getOne();
  }
}
