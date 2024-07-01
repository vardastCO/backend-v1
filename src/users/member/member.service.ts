import { Injectable, BadRequestException } from "@nestjs/common";
import { I18n, I18nService } from "nestjs-i18n";
import { AuthorizationService } from "src/users/authorization/authorization.service";
import { User } from "src/users/user/entities/user.entity";
import { Member } from "./entities/members.entity";
import { CreateMemberInput } from "./dto/create-member.input";


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
        relatedId:createMemberInput.relatedId
      })
      if (hasMember) {
        throw new BadRequestException(
          await this.i18n.translate("exceptions.FOUND_MEMBER_IN_LEGAL"),
        );
      }
      const assign: Member = new Member();
      assign.userId = await findUser.id
      assign.adminId = user.id
      assign.relatedId = createMemberInput.relatedId
      await assign.save()
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

  // async paginate(
  //   user: User,
  //   indexSellerRepresentativeInput?: IndexSellerRepresentativeInput,
  // ): Promise<PaginationSellerRepresentativeResponse> {
  //   indexSellerRepresentativeInput.boot();
  //   const { take, skip } = indexSellerRepresentativeInput || {};

  //   const [data, total] = await Member.findAndCount({
  //     skip,
  //     take,
  //     order: { id: "DESC" },
  //   });

  //   return PaginationSellerRepresentativeResponse.make(
  //     indexSellerRepresentativeInput,
  //     total,
  //     data,
  //   );
  // }

  // async findOne(id: number): Promise<Member> {
  //   const sellerRepresentative = await Member.findOneBy({ id });
  //   if (!sellerRepresentative) {
  //     throw new NotFoundException();
  //   }
  //   return sellerRepresentative;
  // }

  

  // async update(
  //   id: number,
  //   updateSellerRepresentativeInput: UpdateSellerRepresentativeInput,
  //   user: User,
  // ): Promise<Member> {
  //   const sellerRepresentative: Member =
  //     await Member.preload({
  //       id,
  //       ...updateSellerRepresentativeInput,
  //     });
  //   if (!sellerRepresentative) {
  //     throw new NotFoundException();
  //   }

  //   await sellerRepresentative.save();
  //   return sellerRepresentative;
  // }

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
