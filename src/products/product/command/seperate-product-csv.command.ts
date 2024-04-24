import { Command, CommandRunner } from "nest-commander";
import { Product } from "../entities/product.entity";
import { ParentProductEntity } from "../entities/parent-product.entity";
import { ProductEntity } from "../entities/product-service.entity";

@Command({
  name: "product:seperate",
  description: "product seperate from given csv file base on official format.",
})
export class SeperateProductCommand extends CommandRunner {
  constructor() {
    super();
  }

  // async convertPersianToEnglishNumbers(str) {
  //   const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  //   const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  //   for (let i = 0; i < persianNumbers.length; i++) {
  //       const persianDigit = new RegExp(persianNumbers[i], 'g');
  //       str = str.replace(persianDigit, englishNumbers[i]);
  //   }

  //   return str;
  // }

  async run(): Promise<void> {
    console.log('hi');

    const batchSize = 10;
    const totalProduct = await Product.count();
    const totalPages = Math.ceil(totalProduct / batchSize);

    try {
      for (let page = 1; page <= totalPages; page++) {
        const products = await Product.find({
          skip: (page - 1) * batchSize,
          take: batchSize,
        });

        for (const product of products) {

          try {
            let parent_product_service = await ParentProductEntity.create();

       
            
            let prouduct_service = await ProductEntity.create()
            parent_product_service.name = product.name
            parent_product_service.brandId = product.brandId
            parent_product_service.uomId = product.uomId
            parent_product_service.categoryId = product.categoryId
            await parent_product_service.save()

            prouduct_service.name = product.name
            prouduct_service.sku = product.sku
            prouduct_service.parentId = await parent_product_service.id
            prouduct_service.id = product.id
            prouduct_service.description = product.description ?? null

            await prouduct_service.save()

            product.parentId=parent_product_service.id
            await product.save()
           
            await new Promise((resolve) => setTimeout(resolve, 10));
          } catch (e) {
            console.log("Error processing attribute:", e);
          }
        }
      }

      console.log("All processed.");
    } catch (e) {
      console.log("Error fetching attribute values:", e);
    }
  }
}
