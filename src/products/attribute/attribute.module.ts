import { Module } from "@nestjs/common";
import { AttributeService } from "./attribute.service";
import { AttributeResolver } from "./attribute.resolver";
import { AttReviewCommand } from "./command/att-review-csv.command";

@Module({
  providers: [AttributeResolver, AttributeService, AttReviewCommand],
})
export class AttributeModule {}
