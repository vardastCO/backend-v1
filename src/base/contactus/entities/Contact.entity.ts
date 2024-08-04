import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column,Index, Entity, PrimaryGeneratedColumn } from "typeorm";


@ObjectType()
@Entity("contact_us")
export class ContactUs extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field(() => Int)
    id: number;

    @Field()
    @Column()
    @Index()
    fullname: string;

    @Field()
    @Column()
    @Index()
    title: string;

    @Field()
    @Column()
    @Index()
    cellphone: string;

    @Field()
    @Column()
    @Index()
    text: string;


    @Field(type => Int, { nullable: true })
    @Column("int", { nullable: true })
    fileId?: number;

}