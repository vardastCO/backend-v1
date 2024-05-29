
import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsIn,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from "class-validator";
import { IsNumberString } from "src/base/utilities/decorators/is-number-string.decorator";
import { MultiTypeUom } from "src/order/enums/multi-type-uom.enum";
import { MultiTypeOrder } from "src/order/enums/multu-type-order.enum";
const UOM_VALUES = [
  "لنگه",
  "دستگاه",
  "مترمربع",
  "متر مکعب",
  "کیلوگرم",
  "متر",
  "شاخه",
  "کیسه",
  "جفت",
  "عدد"
];
@InputType()
export class CreateLineInput {
  @Field()
  @IsNotEmpty({message:"این فیلد ضروری است"})
  @IsString()
  @MaxLength(255)
  item_name: string;


  @Field(() => String,{nullable:true}) 
  @IsOptional()
  @IsString()
  @MaxLength(255)
  brand?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsNumberString({ message: 'مقدار به صورت عدد وارد شود' })
  qty?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsIn(UOM_VALUES, {
    message: `مقدار واحد میتواند فقط مقادیر مشخصی داشته باشد: ${UOM_VALUES.join(', ')}`
  })
  uom?: string;

  // @Field(() => MultiTypeUom, {
  //   defaultValue: MultiTypeUom.PIECE,
  //   nullable: true,
  // })
  // @IsNotEmpty()
  // @IsEnum(MultiTypeOrder)
  // uom?: MultiTypeUom = MultiTypeUom.PIECE;

  @Field(() => String,{nullable:true}) 
  @IsOptional()
  @IsString()
  @MaxLength(255)
  attribuite?: string;

  @Field(() => String,{nullable:true}) 
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descriptions?: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  preOrderId: number;

  @Field(() => MultiTypeOrder, {
    defaultValue: MultiTypeOrder.PRODUCT,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(MultiTypeOrder)
  type?: MultiTypeOrder = MultiTypeOrder.PRODUCT;
}
