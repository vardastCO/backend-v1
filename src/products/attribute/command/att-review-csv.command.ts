import { Command, CommandRunner } from "nest-commander";
import { Attribute } from "src/products/attribute/entities/attribute.entity";
import { AttributesProductService } from "../entities/attribute_product.entity";
@Command({
  name: "att:review",
  description: "att review from given csv file base on official format.",
})
export class AttReviewCommand extends CommandRunner {
  constructor() {
    super();
  }
  async run(): Promise<void> {
    const atts = await Attribute.find({});
    try {
      for (const att of atts) {
        try {
          let attribuite = await AttributesProductService.findOneBy({
            name: att.name,
          });
          if (!attribuite) {
            attribuite = await AttributesProductService.create({
              name: att.name,
            });
            await attribuite.save();
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (e) {
          // console.log("ffffff", e);
        }
      }

      console.log("All processed.");
    } catch (e) {
      console.log("ddd", e);
    }
  }
}
