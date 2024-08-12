import { ConfigService } from "@nestjs/config";
import * as Fs from "fs";
import { Client } from "minio";
import { Command, CommandRunner } from "nest-commander";
import { CsvParser } from "nest-csv-parser";
import { InjectMinio } from "nestjs-minio";
import { City } from "src/base/location/city/entities/city.entity";
import { CityTypesEnum } from "src/base/location/city/enums/city-types.enum";
import { Address } from "src/users/address/entities/address.entity";
import { AddressRelatedTypes } from "src/users/address/enums/address-related-types.enum";
import { ContactInfo } from "src/users/contact-info/entities/contact-info.entity";
import { ContactInfoRelatedTypes } from "src/users/contact-info/enums/contact-info-related-types.enum";
import { ContactInfoTypes } from "src/users/contact-info/enums/contact-info-types.enum";
// import { Seller } from "../seller/entities/seller.entity";
import { User } from "src/users/user/entities/user.entity";
import { v4 as uuidv4 } from 'uuid';
import { UserLanguagesEnum } from "src/users/user/enums/user-languages.enum";
import { UserStatusesEnum } from "src/users/user/enums/user-statuses.enum";
import { Role } from "src/users/authorization/role/entities/role.entity";

@Command({
  name: "seller:update",
  description: "update sellers from given csv file base on official format.",
})
export class SellerCsvUpdateCommand extends CommandRunner {
  private headerMap = {
    sellerName: "sellerName",
    // activity: "activity",
    city: "city",
    address: "address",
    phone: "phone",
    // factoryAddress: "factoryAddress",
  };

  private valueMap = {
    csvAttributes: value => {
      const attributes = value.split(/\n|(\r\n)/) ?? [];
      return attributes
        .map(attribute => {
          attribute = attribute ?? "";
          // const [ name, category,brand,sku,filter,uom] = attribute;
          const [sellerName, city, address, phone] =
            attribute;
          return {
            sellerName,
            // activity,
            city,
            address,
            phone,
            // factoryAddress,
          };
        })
        .filter(a => a)
        .reduce((carry, cleanAttribute) => {
          return carry;
        }, {});
    },
  };
  constructor(
    private readonly csvParser: CsvParser,
    @InjectMinio() private readonly minioClient: Client,
    private readonly configService: ConfigService,
  ) {
    super();
  }
  async run(passedParam: string[], options?: any): Promise<void> {
    const [csvFile] = passedParam;
    const stream = Fs.createReadStream(csvFile, "utf8");

    const csvProducts = await this.csvParser.parse(
      stream,
      CsvProduct,
      null,
      null,
      {
        mapHeaders: ({ header, index }) => this.headerMap[header],
        mapValues: ({ header, index, value }) =>
          this.valueMap.hasOwnProperty(header)
            ? this.valueMap[header](value)
            : value,
        separator: ",",
      },
    );

    for (const csvProduct of csvProducts.list) {
      // const { name, category, brand, sku, filter, uom } = csvProduct;
      const { sellerName, city, address, phone } =
        csvProduct;
      
      // console.log('csvProduct',csvProduct)

      try {
        if (phone && sellerName) {
          const user: User = await this.createUser(sellerName, await this.convertPersianToEnglish(phone));
        }
        //  const user: User = await this.createUser(sellerName, 'نامعلوم');
        // const contactInfo: ContactInfo = await this.createContact(
        //   phone,
        //   seller.id,
        // );       
        // await this.createAddress(
        //   city,
        //   address,
        //   seller.id,

        // );
      } catch (e) {
        console.log("Error processing product:", e);
      }
    }

    console.log("All products processed.");
  }

  async createUser(title: string, phone: string): Promise<User> {
    console.log(phone, title)
    console.log('=====================')
    const userRole = await Role.findOneBy({ name: "user" });
    const user = User.create({
      firstName: title,
      uuid: uuidv4(),
      cellphone: phone,
      language: UserLanguagesEnum.FARSI,
      countryId: 244,
      username: phone,
      timezone: "Asia/Terhan",
      status: UserStatusesEnum.ACTIVE,
      displayRoleId:1,
    });
    user.roles = Promise.resolve([userRole]);
    await user.save();

    return user;
  }

  async convertPersianToEnglish(persianNumber) {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
    let englishNumber = persianNumber;
    for (let i = 0; i < persianDigits.length; i++) {
      const persianDigit = new RegExp(persianDigits[i], 'g');
      englishNumber = englishNumber.replace(persianDigit, englishDigits[i]);
    }
  
    return englishNumber;
  }
  

  async createContact(number: string, id: number): Promise<ContactInfo> {
    const contactInfo = ContactInfo.create({
      relatedType: ContactInfoRelatedTypes.SELLER,
      title: "دفتر",
      relatedId: id,
      number: number,
      type: ContactInfoTypes.TEL,
      code: "0",
      ext: "0",
    });
    await contactInfo.save();

    return contactInfo;
  }

  async createAddress(
    city_name: string,
    address: string,
    id: number,
  ) {
    if (address) {
      try {
        let city = await City.findOneBy({
          name: city_name,
        });

        if (!city) {
          city = City.create({
            name: city_name,
            slug: city_name,
            provinceId: 1,
            type: CityTypesEnum.CITY,
            sort: 0,
            isActive: true,
          });
          city.save();
        }

        const addressObj = Address.create({
          relatedType: AddressRelatedTypes.SELLER,
          title: "آدرس",
          address: address,
          countryId: 244,
          relatedId: id,
          cityId: city.id ?? 1,
          provinceId: city.provinceId,
        });

        await addressObj.save();
      } catch (error) {
        // Handle the error (e.g., city not found)
        console.error(error);
        throw error; // Rethrow the error or handle it appropriately
      }
    }

    // if (factoryAddress) {
    //   try {
    //     let city = await City.findOneBy({
    //       name: city_name,
    //     });

    //     if (!city) {
    //       city = City.create({
    //         name: city_name,
    //         slug: city_name,
    //         provinceId: 1,
    //         type: CityTypesEnum.CITY,
    //         sort: 0,
    //         isActive: true,
    //       });
    //       city.save();
    //     }

    //     const addressObj2 = Address.create({
    //       relatedType: AddressRelatedTypes.SELLER,
    //       title: "آدرس کارخانه",
    //       address: factoryAddress,
    //       countryId: 244,
    //       relatedId: id,
    //       cityId: city.id ?? 1,
    //       provinceId: city.provinceId,
    //     });

    //     await addressObj2.save();
    //     return addressObj2;
    //   } catch (error) {
    //     // Handle the error (e.g., city not found)
    //     console.error(error);
    //     throw error; // Rethrow the error or handle it appropriately
    //   }
    // }
  }
}

class CsvProduct {
  sellerName: string;
  activity: string;
  city: string;
  address: string;
  phone: string;
}
