import { Command, CommandRunner } from "nest-commander";
import { AttributeValue } from "../entities/attribute-value.entity";
import { AttributesProductService } from "src/products/attribute/entities/attribute_product.entity";
import { AttributeValuesProductService } from "../entities/attribute-value-service.entity";
import { ValuesService } from "../entities/value-service.entity";

@Command({
  name: "att:recheck",
  description: "att review from given csv file base on official format.",
})
export class AttProductValueCommand extends CommandRunner {
  constructor() {
    super();
  }

  async convertPersianToEnglishNumbers(str) {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    for (let i = 0; i < persianNumbers.length; i++) {
        const persianDigit = new RegExp(persianNumbers[i], 'g');
        str = str.replace(persianDigit, englishNumbers[i]);
    }

    return str;
  }

  async run(): Promise<void> {
    console.log('hi');

    const batchSize = 10;
    const totalAttributes = await AttributeValue.count();
    const totalPages = Math.ceil(totalAttributes / batchSize);

    try {
      for (let page = 1; page <= totalPages; page++) {
        const atts = await AttributeValue.find({
          skip: (page - 1) * batchSize,
          take: batchSize,
        });

        for (const att of atts) {


          let attribute_values_service = await AttributeValuesProductService.create();

          try {
            let attribute = await AttributesProductService.findOneBy({
              name: (await att.attribute).name,
            });

            if (!attribute) {
              throw (await att.attribute).name;
            }
            // console.log('aaa',att.value)

            const jsonString = JSON.stringify(att.value).replace(/"/g, '');

            if (jsonString !== '{}') {
              let value = await ValuesService.findOneBy({
                value : jsonString
              });
  
              if (!value) {
                value = ValuesService.create({
                  value : jsonString
                })
              }
              await value.save()
              attribute_values_service.attributeId = await attribute.id;
              attribute_values_service.productId = att.productId;
              attribute_values_service.valueId = value.id

              await attribute_values_service.save();
            }
           
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
