// src/options/options.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Option } from './entities/option.entity';
import { CreateOptionInput } from './dto/option.dto';
import { ParentProductEntity } from '../product/entities/parent-product.entity';
import { ProductEntity } from '../product/entities/product-service.entity';

@Injectable()
export class OptionsService {
  constructor(
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
  ) {}

  async create(input: CreateOptionInput): Promise<Option> {
    // console.log("Input received:", input);

        const productEntities = await ProductEntity.findByIds(input.productIds);

        if (!productEntities || productEntities.length === 0) {
          throw new Error("No products found with the given IDs.");
        }
        
        const parentProductIds = productEntities.map(product => product.parentId);
        
        const parentProducts = await ParentProductEntity.findByIds(parentProductIds);
        
        const firstParentProduct = parentProducts[0];
        
        if (!firstParentProduct) {
          throw new Error("Invalid productId. No matching parent product found.");
        }
        
        const isValid = parentProducts.every(parentProduct =>
          parentProduct.categoryId === firstParentProduct.categoryId &&
          parentProduct.uomId === firstParentProduct.uomId &&
          parentProduct.brandId === firstParentProduct.brandId
        );
        
        if (!isValid) {
          throw new Error("Invalid input: Products must have the same Category, Uom, and Brand in their parent entities.");
        }
        const parentId = productEntities[0].parentId;

        productEntities.forEach(product => {
          product.parentId = parentId;
        });

        await ProductEntity.save(productEntities);

        const option = Option.create()
        option.valueId = input.valueId
        option.attribuiteId = input.attributeId
        option.parentProductId = parentId
        await option.save()

      return await option
  }

//   async update(id: number, input: CreateOptionInput): Promise<null> {
//     // const option = await this.optionRepository.findOne(id);
//     // if (!option) {
//     //   return null; 
//     // }

//     // return this.optionRepository.save(option);
//     return null
//   }

//   async delete(id: number): Promise<boolean> {
//     const result = await this.optionRepository.delete(id);
//     return result.affected > 0;
//   }
}
