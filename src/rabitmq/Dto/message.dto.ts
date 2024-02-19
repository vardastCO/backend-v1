import { Transform } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class MessageDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  chatRoomId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  senderId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  message: string;
}
