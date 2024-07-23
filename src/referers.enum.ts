import { registerEnumType } from "@nestjs/graphql";

export enum ReferersEnum {
    CLIENT_VARDAST_IR = 'https://client.vardast.ir',
    VARDAST_COM = 'https://vardast.com'
}

registerEnumType(ReferersEnum, { name: "ReferersEnum" });