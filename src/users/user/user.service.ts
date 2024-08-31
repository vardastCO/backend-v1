import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { hash } from "argon2";
import { Cache } from "cache-manager";
import { Country } from "src/base/location/country/entities/country.entity";
import { FileService } from "src/base/storage/file/file.service";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { Seller } from "src/products/seller/entities/seller.entity";
import { SellerRepresentativeRoles } from "src/products/seller/enums/seller-representative-roles.enum";
import { DataSource, EntityManager, In, Like, Repository } from "typeorm";
import { KavenegarService } from "../../base/kavenegar/kavenegar.service";
import { CountryService } from "../../base/location/country/country.service";
import { Address } from "../address/entities/address.entity";
import { AddressRelatedTypes } from "../address/enums/address-related-types.enum";
import { AuthorizationService } from "../authorization/authorization.service";
import { Permission } from "../authorization/permission/entities/permission.entity";
import { Role } from "../authorization/role/entities/role.entity";
import { CreateUserInput } from "./dto/create-user.input";
import { IndexUserInput } from "./dto/index-user.input";
import { PaginationUserResponse } from "./dto/pagination-user.response";
import { UpdateProfileInput } from "./dto/update-profile.input";
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
    private authorizationService: AuthorizationService,
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    private readonly entityManager: EntityManager,
  ) {}

  async create(
    createUserInput: CreateUserInput,
    currentUser: User,
  ): Promise<User> {
    const user: User = User.create(
      await createUserInput.prepare(this.dataSource),
    );

    // if (createUserInput.avatarUuid) {
    //   const file = await this.fileService.getNewlyUploadedFileOrFail(
    //     "user/user/avatars",
    //     createUserInput.avatarUuid,
    //     User.name,
    //     currentUser.id,
    //   );

    //   user.avatarFile = Promise.resolve(file);

    //   delete createUserInput.avatarUuid;
    // }

    if (createUserInput.roleIds) {
      const roles = await Role.findBy({ id: In(createUserInput.roleIds) });
      if (roles.length != createUserInput.roleIds.length) {
        throw new BadRequestException("Some roles are invalid.");
      }
      user.roles = Promise.resolve(roles);
    }

    // if (createUserInput.permissionIds) {
    //   const permissions = await Permission.findBy({
    //     id: In(createUserInput.permissionIds),
    //   });
    //   if (permissions.length != createUserInput.permissionIds.length) {
    //     throw new BadRequestException("Some permissions are invalid.");
    //   }
    //   user.permissions = Promise.resolve(permissions);
    // }
    user.countryId = Country.IR;
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
    const { take, skip, status, birth, cellphone, email, nationalCode } =
      indexUserInput || {};
    const whereConditions: any = {};

    if (status) {
      whereConditions["status"] = status as UserStatusesEnum;
    }

    if (nationalCode) {
      whereConditions["nationalCode"] = Like(`%${nationalCode}%`);
    }

    if (email) {
      whereConditions["email"] = Like(`%${email}%`);
    }

    if (cellphone) {
      whereConditions["cellphone"] = Like(`%${cellphone}%`);
    }

    if (birth) {
      whereConditions["birth"] = birth;
    }

    if (indexUserInput.roleIds && indexUserInput.roleIds.length > 0) {
      whereConditions.roles = { id: In(indexUserInput.roleIds) };
    }

    const [data, total] = await User.findAndCount({
      skip,
      take,
      where: whereConditions,
      order: { id: "DESC" },
    });

    return PaginationUserResponse.make(indexUserInput, total, data);
  }

  async getAddressesOf(user: User): Promise<Address[]> {
    const addresses = await Address.createQueryBuilder()
      .limit(15)
      .where({ relatedType: AddressRelatedTypes.USER, relatedId: user.id })
      .orderBy({ sort: "ASC" })
      .getMany();

    return addresses;
  }

  async findOne(id: number, uuid?: string): Promise<User> {
    const user = await User.findOne({
      where: {
        id: id,
        uuid: uuid,
      },
      relations: ["roles.permissions"],
    });
    if (!user) {
      throw new NotFoundException();
    }
    user.addresses = await this.getAddressesOf(user);
    // const permissions = roles.flatMap(role => role.permissions);
    // const uniqueClaims = [...new Set<string>(permissions.map(permission => permission.claim))];
    // user.claims = uniqueClaims.length > 0 ? uniqueClaims : [];
    return user;
  }

  async hashPassword(password: string): Promise<string> {
    return await hash(password);
  }

  async update(
    id: number,
    updateUserInput: UpdateUserInput,
    currentUser: User,
    admin: boolean,
  ): Promise<User> {
    try {
      const userAuth = await this.authorizationService.setUser(currentUser);
      let user_id = currentUser.id;

      if (userAuth.hasRole("admin") && id) {
        user_id = id;
      }
      const user: User = await User.findOneBy({ id: user_id });

      if (!user) {
        throw new NotFoundException();
      }

      const originalUser = { ...user };

      if (updateUserInput.password) {
        updateUserInput.password = await this.hashPassword(
          updateUserInput.password,
        );
      }
      const displayRoleId = updateUserInput.displayRoleId;
      const role_ids = updateUserInput.roleIds;
      delete updateUserInput.displayRoleId;
      delete updateUserInput.roleIds;

      Object.assign(user, updateUserInput);

      if (displayRoleId) {
        try {
          await this.entityManager.query(
            `update users
             set "displayRoleId" = $1
             where "id" = $2 
            `,
            [displayRoleId, user.id],
          );
        } catch (error) {
          console.log("error :", error);
        }
      }

      if (role_ids) {
        await this.entityManager.query(
          `
            delete from "users_authorization_user_roles"
            where "userId" = $1
          `,
          [user.id],
        );

        await this.entityManager.query(
          `
          INSERT INTO "users_authorization_user_roles" ("userId", "roleId")
          SELECT $1, UNNEST($2::int[]);
          `,
          [user.id, role_ids],
        );

        const cacheKey = `roles_user_{id:${JSON.stringify(user.id)}}`;
        await this.cacheManager.del(cacheKey);
        await user.save();
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

      await user.save();

      if (updateUserInput.roleIds) {
        await this.cacheRolesOf(user);
        await this.cachePermissionsOf(user);
      }

      return user;
    } catch (error) {
      console.log(error);
    }
  }

  async updateProfile(
    updateProfileInput: UpdateProfileInput,
    currentUser: User,
  ): Promise<User> {
    const user: User = await User.findOneBy({ id: currentUser.id });

    if (!user) {
      throw new NotFoundException();
    }

    Object.assign(user, updateProfileInput);
    const { firstName, lastName } = updateProfileInput;
    if (firstName || lastName) {
      user.fullName = [firstName, lastName].filter(Boolean).join(" ");
    } else {
      user.fullName = "کاربر وردست";
    }

    this.dataSource.transaction(async () => {
      await user.save({ transaction: false });
    });

    // if (updateProfileInput.name_company || updateProfileInput.national_id) {
    //   try {
    //   let legal
    //   legal = await Legal.findOne({
    //     where: {
    //       createdById: user.id
    //     },
    //     order: {
    //       id: "DESC"
    //     }
    //   });
    //   if (!legal) {
    //     legal        = new Legal()
    //     if (updateProfileInput.name_company) {
    //       legal.name_company = updateProfileInput.name_company
    //     }
    //     if (updateProfileInput.national_id) {
    //       legal.national_id = updateProfileInput.national_id
    //     }
    //     legal.createdById = user.id
    //     legal.ownerId = user.id
    //     await legal.save()

    //     const member = new Member()
    //     // member.adminId = user.id
    //     member.userId = user.id
    //     member.position = 'مدیرعامل'
    //     member.relatedId = legal.id
    //     await member.save()
    //   } else {
    //     if (updateProfileInput.name_company) {
    //       legal.name_company = updateProfileInput.name_company
    //     }
    //     if (updateProfileInput.national_id) {
    //       legal.national_id = updateProfileInput.national_id
    //     }
    //     await legal.save()
    //   }
    //   user.legal = legal
    //   } catch (e) {
    //     console.log('err in add legal',e)
    //   }

    // }

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

  async getCountry(user: User): Promise<Country> {
    const cacheKey = `getCountry`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);
    if (cachedData) {
      return await this.decompressionService.decompressData(cachedData);
    }
    const result = await this.countryService.findOne(user.countryId);
    await this.cacheManager.set(
      cacheKey,
      this.compressionService.compressData(result),
      CacheTTL.ONE_DAY,
    );
    return result;
  }

  async getRoles(user: User): Promise<Role[]> {
    const cacheKey = `user:roles_${user.id}`;
    const cachedRoles = await this.cacheManager.get<string>(cacheKey);

    if (cachedRoles) {
      return this.decompressionService.decompressData(cachedRoles);
    }

    const roles = await user.roles;
    await this.cacheManager.set(
      cacheKey,
      this.compressionService.compressData(roles),
      CacheTTL.ONE_DAY,
    );

    return roles;
  }

  async getPermissions(user: User): Promise<Permission[]> {
    const cacheKey = `user:permissions_${user.id}`;
    const cachedRoles = await this.cacheManager.get<string>(cacheKey);

    if (cachedRoles) {
      return this.decompressionService.decompressData(cachedRoles);
    }

    const result = await user.permissions;
    await this.cacheManager.set(
      cacheKey,
      this.compressionService.compressData(result),
      CacheTTL.ONE_DAY,
    );

    return result;
  }

  async cacheRolesOf(user: User): Promise<string[]> {
    const cacheKey = `roles_user_{id:${JSON.stringify(user.id)}}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);
    if (cachedData) {
      return this.decompressionService.decompressData(cachedData);
    }
    const roleNames = (await user.roles).map(role => role.name);
    await this.cacheManager.set(
      cacheKey,
      this.compressionService.compressData(roleNames),
      CacheTTL.ONE_DAY,
    );
    return roleNames;
  }

  async cachePermissionsOf(user: User): Promise<string[]> {
    const cacheKey = `permissions_user_{id:${JSON.stringify(user.id)}}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);

    if (cachedData) {
      const decompressedData =
        this.decompressionService.decompressData(cachedData);
      return decompressedData.filter(permission =>
        permission.endsWith(".index"),
      );
    }

    const userWholePermissions = await user.wholePermissionNames();
    const limitedPermissions = userWholePermissions.filter(permission =>
      permission.endsWith(".index"),
    );

    await this.cacheManager.set(
      cacheKey,
      this.compressionService.compressData(limitedPermissions),
      CacheTTL.ONE_DAY,
    );

    return limitedPermissions;
  }

  async getSellerRecordOf(user: User): Promise<Seller> {
    const cacheKey = `seller_${user.id}_${SellerRepresentativeRoles.ADMIN}`;
    let seller = await this.cacheManager.get<Seller>(cacheKey);

    if (!seller) {
      seller = await Seller.createQueryBuilder()
        .where(
          'id = (select "sellerId" from product_seller_representatives where "userId" = :userId and role = :role order by id asc limit 1)',
          {
            userId: user.id,
            role: SellerRepresentativeRoles.ADMIN,
          },
        )
        .getOne();

      if (seller) {
        await this.cacheManager.set(cacheKey, seller, CacheTTL.ONE_DAY);
      }
    }

    return seller;
  }
}
