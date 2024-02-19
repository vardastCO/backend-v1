import { Injectable, NotFoundException } from "@nestjs/common";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { User } from "src/users/user/entities/user.entity";
import { In } from "typeorm";
import { Uom } from "../uom/entities/uom.entity";
import { CreateAttributeInput } from "./dto/create-attribute.input";
import { IndexAttributeInput } from "./dto/index-attribute.input";
import { PaginationAttributeResponse } from "./dto/pagination-attribute.response";
import { UpdateAttributeInput } from "./dto/update-attribute.input";
import { Attribute } from "./entities/attribute.entity";

@Injectable()
export class AttributeService {
  async create(
    createAttributeInput: CreateAttributeInput,
    user: User,
  ): Promise<Attribute> {
    const attribute: Attribute = Attribute.create(createAttributeInput);
    attribute.createdBy = Promise.resolve(user);

    if (createAttributeInput.hasOwnProperty("categoryIds")) {
      const categories =
        createAttributeInput.categoryIds.length > 0
          ? await Category.findBy({
              id: In(createAttributeInput.categoryIds),
            })
          : [];
      attribute.categories = Promise.resolve(categories);
    }

    await attribute.save();
    return attribute;
  }

  async findAll(
    indexAttributeInput?: IndexAttributeInput,
  ): Promise<Attribute[]> {
    const { take, skip, type, uomId, createdById } = indexAttributeInput || {};
    return await Attribute.find({
      skip,
      take,
      where: { type, uomId, createdById },
      order: { id: "DESC" },
    });
  }

  async paginate(
    indexAttributeInput?: IndexAttributeInput,
  ): Promise<PaginationAttributeResponse> {
    indexAttributeInput.boot();
    const { take, skip, type, uomId, createdById } = indexAttributeInput || {};
    const [data, total] = await Attribute.findAndCount({
      skip,
      take,
      where: { type, uomId, createdById },
      order: { id: "DESC" },
    });

    return PaginationAttributeResponse.make(indexAttributeInput, total, data);
  }

  async findOne(id: number, slug?: string): Promise<Attribute> {
    const attribute = await Attribute.findOneBy({ id, slug });
    if (!attribute) {
      throw new NotFoundException();
    }
    return attribute;
  }

  async update(
    id: number,
    updateAttributeInput: UpdateAttributeInput,
  ): Promise<Attribute> {
    const attribute: Attribute = await Attribute.preload({
      id,
      ...updateAttributeInput,
    });
    if (!attribute) {
      throw new NotFoundException();
    }

    if (updateAttributeInput.hasOwnProperty("categoryIds")) {
      const categories =
        updateAttributeInput.categoryIds.length > 0
          ? await Category.findBy({
              id: In(updateAttributeInput.categoryIds),
            })
          : [];
      attribute.categories = Promise.resolve(categories);
    }
    await attribute.save();
    return attribute;
  }

  async remove(id: number): Promise<Attribute> {
    const attribute: Attribute = await this.findOne(id);
    await attribute.remove();
    attribute.id = id;
    return attribute;
  }

  async getCategoriesOf(attribute: Attribute): Promise<Category[]> {
    return await attribute.categories;
  }

  async getUomOf(attribute: Attribute): Promise<Uom> {
    return await attribute.uom;
  }

  async getCreatedByOf(attribute: Attribute): Promise<User> {
    return await attribute.createdBy;
  }
}
