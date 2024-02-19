import { Transform } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateFilePublicDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  directoryPath: string;

  @IsOptional()
  @Transform(({ value }) => (Number.isNaN(+value) ? value : +value))
  @IsInt()
  modelId?: number;

  @IsOptional()
  modelType ?: string;
  
  @IsOptional()
  orderColumn ?: number;
}
