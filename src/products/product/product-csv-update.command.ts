import * as Fs from "fs";
import { Command, CommandRunner } from "nest-commander";
import { CsvParser } from "nest-csv-parser";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { Product } from "src/products/product/entities/product.entity";
import { ConfigService } from "@nestjs/config";
import { Client } from "minio";
import { InjectMinio } from "nestjs-minio";
import { Brand } from "src/products/brand/entities/brand.entity";
import { AttributeValue } from "../attribute-value/entities/attribute-value.entity";
import { Attribute } from "../attribute/entities/attribute.entity";
import { AttributeTypesEnum } from "../attribute/enums/attribute-types.enum";
import { Uom } from "../uom/entities/uom.entity";

@Command({
  name: "product:update",
  description: "update products from given csv file base on official format.",
})
export class ProductCsvUpdateCommand extends CommandRunner {
  private headerMap = {
    "name": "name",
    "category": "category",
    "sku" : "sku",
    // "filter":"filter",
    // "uom" : "uom"
  };
 
  private valueMap = {
    csvAttributes: value => {
      const attributes = value.split(/\n|(\r\n)/) ?? [];
      return attributes
          .map((attribute) => {
            attribute = attribute ?? "";
            // const [ name, category,brand,sku,filter,uom] = attribute;
             const [ sku,category,name,brand] = attribute;
            return {
              name,
              category,
              brand,
              sku,
              // uom,
              // filter
    
            };
          })
          .filter((a) => a)
          .reduce((carry, cleanAttribute) => {
          
          
          
          return carry;
        }, {});
    },
  };
  constructor(
    private readonly csvParser: CsvParser,
    @InjectMinio() private readonly minioClient: Client,
    private readonly configService: ConfigService,
  ) {
    super();
  }
  async run(passedParam: string[], options?: any): Promise<void> {

    const [csvFile] = passedParam;
    const stream = Fs.createReadStream(csvFile, "utf8");
   
    const csvProducts = await this.csvParser.parse(
      stream,
      CsvProduct,
      null,
      null,
      {
        mapHeaders: ({ header, index }) => this.headerMap[header],
        mapValues: ({ header, index, value }) =>
          this.valueMap.hasOwnProperty(header)
            ? this.valueMap[header](value)
            : value,
        separator: ",",
      },
    );

    const batchSize = 5;
    let batchCount = 0;
  
    for (let i = 0; i < csvProducts.list.length; i += batchSize) {
      // for (let i = 0; i < 5; i += batchSize) {
      const batch = csvProducts.list.slice(i, i + batchSize);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try{
        for (const csvProduct of batch) {
            // const { name, category, brand, sku,filter , uom } = csvProduct;
            const { sku , category ,name} = csvProduct;
            let product: Product = await Product.findOneBy({
              sku: sku,
            });
            if(!product){
              throw product;
            }
            product.name = name   
  
            const category2: Category = await this.firstOrCreateCategory(category);
    
            if (!category2) {
              throw category;
            }
            console.log(category2.title)
            product.categoryId = category2.id
  
            // product.save()
    
            // let attributesArray = filter.split('-');
  
            // // Use forEach to iterate over the array
            // attributesArray.forEach(async function(attribute) {
  
            //     try {
            //           const attributeValue = await AttributeValue.findOne({
            //             where: {
            //               productId:product.id,
            //             },
            //           });
            //           if(attributeValue){
            //             const attributeSlug = `${attribute.name}:${category2.id}`;
            //             let you = Attribute.findOneBy({
            //               id : attributeValue.attributeId
  
            //             });
  
            //             if (!you) {
            //               attribute = Attribute.create({
            //                 name: attributess.name,
            //                 type: AttributeTypesEnum.TEXT,
            //                 values: null,
            //                 slug: attributeSlug,
            //                 uomId:  null,
            //               });
  
            //               (await attribute).isPublic = true ;
            //               (await attribute).isFilterable = true ;
            //               (await attribute).isRequired = true ;
                                                 
            //               attribute.categories = Promise.resolve([category2]);
            //               await attribute.save();
            //             } else {
            //               (await you).isPublic = true ;
            //               (await you).isFilterable = true ;
            //               (await you).isRequired = true ;
    
            //               (await you).save()
    
            //               console.log('you',you)
  
            //           }
            //           }
                          
             
      
            //     } catch (error) {
            //       console.error('Error retrieving attribute values:', error);
            //       // Handle the error appropriately
            //     }
  
            // });
      
    
            // let brand2: Brand = await this.firstOrCreateBrand(brand);
    
            // if (!brand2) {
            
            //     throw product;
              
            // }
            // product.brandId = brand2.id;
            // try{
            //   await product.save();
            // }catch(e){

            // }
          
    
            // console.log('Saved', product.name);
            //=============================================\\

            // let unit = await this.firstOrCreateUom(csvProduct.uom);
            // if (!unit) {
            //   product.uomId = 1
                
            // } else {
            //   product.uomId = unit.id
            // }
            

            await product.save()

        }  
      }catch(e){
        console.log('rrrrrr',e)
      }
  
      batchCount++;
      console.log(`Batch ${batchCount} processed.`);
    }
  
    console.log("Finished.");
  

  
  }



  async firstOrCreateCategory(title: string): Promise<Category> {

     let cat : Category =  await Category.findOneBy({
      title: title,
    });

    if(!cat){
      console.log('title not found' ,title)
      cat = Category.create({
                title: title,
                slug: title,
                vocabularyId:1,
                parentCategoryId: 3876,
              });
      await cat.save()
    }

    return cat

   
  }

  async firstOrCreateBrand(title: string): Promise<Brand> {

    let brn =   await Brand.findOneBy({
     name: title,
   });

   
   if(!brn){
    brn = Brand.create({
      name: title,
      slug: title,
    });
    await brn.save()
  }
  return brn ;
  
 }
 async firstOrCreateUom(name: string): Promise<Uom> {
  let uom = await Uom.findOneBy({
    name:name,
 });
  if (!uom) {
    try{
      uom = Uom.create({
        name: name,
        slug: name,
        symbol: name,
        isActive: true,
      });
      await uom.save();

    }catch(e){
      console.log('eeeeeeeeee',e)
    }


  }
  console.log('uom',uom)
  return uom;
}



 
}
class CsvProduct {
  name: string;
  category: string;
  brand: string;
  sku: string;
  uom: string;
}