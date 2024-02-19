import { Injectable, NotFoundException } from "@nestjs/common";
import { Like } from "typeorm";
import { Product } from "../product/entities/product.entity";
import { CreateAttributeValueInput } from "./dto/create-attribute-value.input";
import { IndexAttributeValueInput } from "./dto/index-attribute-value.input";
import { PaginationAttributeValueResponse } from "./dto/pagination-attribute-value.response";
import { UpdateAttributeValueInput } from "./dto/update-attribute-value.input";
import { AttributeValue } from "./entities/attribute-value.entity";

@Injectable()
export class AttributeValueService {
  async create(
    createAttributeValueInput: CreateAttributeValueInput,
  ): Promise<AttributeValue> {
    const attributeValue: AttributeValue =
      AttributeValue.create<AttributeValue>(createAttributeValueInput);
    await attributeValue.save();
    return attributeValue;
  }

  async findAll(
    indexAttributeValueInput?: IndexAttributeValueInput,
  ): Promise<AttributeValue[]> {
    const { take, skip, productId, attributeId, isVariant, sku } =
      indexAttributeValueInput || {};
    return await AttributeValue.find({
      skip,
      take,
      where: { productId, attributeId, isVariant, sku: sku ? Like(sku) : sku },
      order: { id: "DESC" },
    });
  }

  async paginate(
    indexAttributeValueInput?: IndexAttributeValueInput,
  ): Promise<PaginationAttributeValueResponse> {
    indexAttributeValueInput.boot();
    const { take, skip, productId, attributeId, isVariant, sku } =
      indexAttributeValueInput || {};
    const [data, total] = await AttributeValue.findAndCount({
      skip,
      take,
      where: { productId, attributeId, isVariant, sku: Like(sku) },
      order: { id: "DESC" },
    });

    return PaginationAttributeValueResponse.make(
      indexAttributeValueInput,
      total,
      data,
    );
  }

  async findOne(id: number): Promise<AttributeValue> {
    const attributeValue = await AttributeValue.findOneBy({ id });
    if (!attributeValue) {
      throw new NotFoundException();
    }
    return attributeValue;
  }

  async update(
    id: number,
    updateAttributeValueInput: UpdateAttributeValueInput,
  ): Promise<AttributeValue> {
    const attributeValue: AttributeValue = await AttributeValue.preload({
      id,
      ...updateAttributeValueInput,
    });
    if (!attributeValue) {
      throw new NotFoundException();
    }
    await attributeValue.save();
    return attributeValue;
  }

  async remove(id: number): Promise<AttributeValue> {
    const attributeValue: AttributeValue = await this.findOne(id);
    await attributeValue.remove();
    attributeValue.id = id;
    return attributeValue;
  }

  async getProductOf(attributeValue: AttributeValue): Promise<Product> {
    return await attributeValue.product;
  }
}
