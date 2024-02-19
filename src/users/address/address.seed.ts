import { Country } from "src/base/location/country/entities/country.entity";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { Address } from "./entities/address.entity";
import { AddressRelatedTypes } from "./enums/address-related-types.enum";

export default class AddressSeeder {
  private readonly data = [
    // Iliya Steel
    {
      relatedType: AddressRelatedTypes.SELLER,
      relatedId: 1,
      title: "شوروم مرکزی",
      provinceId: 1,
      cityId: 1,
      address: "تهران - خیابان شریعتی - دوراهی قلهک - فروشگاه ایلیا استیل",
      postalCode: null,
      latitude: 51.5037689070867,
      longitude: -0.2103183706877512,
      sort: 0,
      isPublic: true,
      status: ThreeStateSupervisionStatuses.CONFIRMED,
      adminId: 1,
    },
    {
      relatedType: AddressRelatedTypes.SELLER,
      relatedId: 1,
      title: "کارخانه",
      provinceId: 1,
      cityId: 1,
      address:
        "شهرک صنعتی پرند -بلوار صنعت - خیابان نور - خیابان افرا -قطعه A57",
      postalCode: null,
      latitude: null,
      longitude: null,
      sort: 0,
      isPublic: true,
      status: ThreeStateSupervisionStatuses.CONFIRMED,
      adminId: 1,
    },
    {
      relatedType: AddressRelatedTypes.SELLER,
      relatedId: 1,
      title: "دفتر مرکزی",
      provinceId: 1,
      cityId: 1,
      address: "تهران ، خیابان شریعتی ، بالاتر از ظفر ، کوچه جم ، پلاک 15",
      postalCode: null,
      latitude: null,
      longitude: null,
      sort: 0,
      isPublic: true,
      status: ThreeStateSupervisionStatuses.CONFIRMED,
      adminId: 1,
    },

    // Iliya Steel
    {
      relatedType: AddressRelatedTypes.BRAND,
      relatedId: 2,
      title: "شوروم مرکزی",
      provinceId: 1,
      cityId: 1,
      address: "تهران - خیابان شریعتی - دوراهی قلهک - فروشگاه ایلیا استیل",
      postalCode: null,
      latitude: 51.5037689070867,
      longitude: -0.2103183706877512,
      sort: 0,
      isPublic: true,
      status: ThreeStateSupervisionStatuses.CONFIRMED,
      adminId: 1,
    },
    {
      relatedType: AddressRelatedTypes.BRAND,
      relatedId: 2,
      title: "کارخانه",
      provinceId: 1,
      cityId: 1,
      address:
        "شهرک صنعتی پرند -بلوار صنعت - خیابان نور - خیابان افرا -قطعه A57",
      postalCode: null,
      latitude: null,
      longitude: null,
      sort: 0,
      isPublic: true,
      status: ThreeStateSupervisionStatuses.CONFIRMED,
      adminId: 1,
    },
    {
      relatedType: AddressRelatedTypes.BRAND,
      relatedId: 2,
      title: "دفتر مرکزی",
      provinceId: 1,
      cityId: 1,
      address: "تهران ، خیابان شریعتی ، بالاتر از ظفر ، کوچه جم ، پلاک 15",
      postalCode: null,
      latitude: null,
      longitude: null,
      sort: 0,
      isPublic: true,
      status: ThreeStateSupervisionStatuses.CONFIRMED,
      adminId: 1,
    },

    // Kasra
    {
      relatedType: AddressRelatedTypes.BRAND,
      relatedId: 1,
      title: "دفتر مرکزی",
      provinceId: 1,
      cityId: 1,
      address: "تهران , خیابان بنی هاشم , خیابان شهید حمید صالحی پلاک ۴۶",
      postalCode: null,
      latitude: null,
      longitude: null,
      sort: 0,
      isPublic: true,
      status: ThreeStateSupervisionStatuses.CONFIRMED,
      adminId: 1,
    },
  ];

  async run(): Promise<any> {
    if ((await Address.count()) == 0) {
      const iran = await Country.findOneBy({ alphaTwo: "IR" });
      for (const addressData of this.data) {
        const address = Address.create({ countryId: iran.id, ...addressData });
        await address.save();
      }
    }
  }
}
