import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { I18n, I18nService } from "nestjs-i18n";
import { AuthorizationService } from "src/users/authorization/authorization.service";
import { User } from "src/users/user/entities/user.entity";
import { CreateMemberInput } from "./dto/create-member.input";
import { UpdateMemberInput } from "./dto/update-member.input";
import { Member } from "./entities/members.entity";
import { MemberRoles } from "./enums/member.enum";
import { PaginationMemberResponse } from "./dto/pagination-member.response";
import { IndexMemberInput } from "./dto/index-member.input";


@Injectable()
export class MemberService {
  constructor(
    @I18n() protected readonly i18n: I18nService,
    private authorizationModule: AuthorizationService,
  ) {}

  async create(
    createMemberInput: CreateMemberInput,
    user: User,
  ): Promise<boolean> {
    const findUser = await User.findOneBy({
      cellphone:createMemberInput.cellphone
    })
    
    
    if (findUser) {
      delete createMemberInput.cellphone
      const hasMember = await Member.findOneBy({
        relatedId: createMemberInput.relatedId,
        userId: findUser.id
      })

      if (hasMember) {
        throw new BadRequestException(
          await this.i18n.translate("exceptions.FOUND_MEMBER_IN_LEGAL"),
        );
      }

      const member: Member = new Member();
      member.userId = await findUser.id;
      member.type = createMemberInput.typeMember;
      member.position = createMemberInput.position;
      member.role = createMemberInput.role ?? MemberRoles.ADMIN
      // member.adminId = user.id
      member.relatedId = createMemberInput.relatedId;
      await member.save()
      return true
    } else {
      return false

    }
  }

  // async findAll(
  //   user: User,
  //   indexSellerRepresentativeInput?: IndexSellerRepresentativeInput,
  // ): Promise<Member[]> {
  //   const { take, skip } = indexSellerRepresentativeInput || {};

  //   return await Member.find({
  //     skip,
  //     take,
  //     order: { id: "DESC" },
  //   });
  // }

  async paginate(
    user: User,
    indexMemberInput?: IndexMemberInput,
  ): Promise<PaginationMemberResponse> {
    indexMemberInput.boot();
    const { take, skip ,type,relatedId } = indexMemberInput || {};
    const whereCondition: any = {};
  
  
    if (type && relatedId) {
      whereCondition.relatedId = relatedId;
      whereCondition.type = type;
    } 
    const [data, total] = await Member.findAndCount({
      skip,
      take,
      where:whereCondition,
      order: { id: "DESC" },
    });

    return PaginationMemberResponse.make(
      indexMemberInput,
      total,
      data,
    );
  }

  async findOne(id: number): Promise<Member> {
    const member = await Member.findOneBy({ id });
    if (!member) {
      throw new BadRequestException(
        await this.i18n.translate("exceptions.NOT_FOUND"),
      );
    }
    return member;
  }

  

  async update(
    id: number,
    updateMemberInput: UpdateMemberInput,
    user: User,
  ): Promise<Member> {
    const member: Member =
      await Member.preload({
        id,
        ...updateMemberInput,
      });
    
    if (!member) {
      throw new NotFoundException();
    }

    await member.save();
    return member;
  }


  async remove(id: number): Promise<boolean> {
    try {
      const member: Member = await Member.findOneBy({ id });
      await member.remove();
      member.id = id;
      return true;
    } catch (e) {
      console.log('err in remove member', e)
      return false;
    }
   
  }
}
