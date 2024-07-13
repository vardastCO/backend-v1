import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty, IsString, IsOptional } from "class-validator";

@InputType()
export class UpdateBannerInput {
    @Field(() => Int)
    @IsNotEmpty()
    @IsInt()
    id: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    small_uuid?: string;
        
    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    medium_uuid?: string;
    
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    large_uuid?: string;
    
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    xlarge_uuid?: string;
    

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    link_url?: string;
}