import { PartialType } from "@nestjs/mapped-types";
import { CreateFilePublicDto } from "./create-file.public.dto";

export class UpdateFilePublicDto extends PartialType(CreateFilePublicDto) {}
