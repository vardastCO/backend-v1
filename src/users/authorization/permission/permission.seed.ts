import { EventTracker } from "src/base/event-tracker/entities/event-tracker.entity";
import { Area } from "src/base/location/area/entities/area.entity";
import { City } from "src/base/location/city/entities/city.entity";
import { Country } from "src/base/location/country/entities/country.entity";
import { Province } from "src/base/location/province/entities/province.entity";
import { Directory } from "src/base/storage/directory/entities/directory.entity";
import { File } from "src/base/storage/file/entities/file.entity";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { Vocabulary } from "src/base/taxonomy/vocabulary/entities/vocabulary.entity";
import { AttributeValue } from "src/products/attribute-value/entities/attribute-value.entity";
import { Attribute } from "src/products/attribute/entities/attribute.entity";
import { Brand } from "src/products/brand/entities/brand.entity";
import { Image } from "src/products/images/entities/image.entity";
import { Offer } from "src/products/offer/entities/offer.entity";
import { Price } from "src/products/price/entities/price.entity";
import { Product } from "src/products/product/entities/product.entity";
import { SellerRepresentative } from "src/products/seller/entities/seller-representative.entity";
import { Seller } from "src/products/seller/entities/seller.entity";
import { Uom } from "src/products/uom/entities/uom.entity";
import { Address } from "src/users/address/entities/address.entity";
import { ContactInfo } from "src/users/contact-info/entities/contact-info.entity";
import { User } from "src/users/user/entities/user.entity";
import { Role } from "../role/entities/role.entity";
import { Permission } from "./entities/permission.entity";
import { PermissionActionsEnum } from "./enums/permission-actions.enum";
import MasterPermissionSeeder, {
  PermissionSeedObject,
} from "./master-permission.seed";
import { ResourcePermissionSeed } from "./resource-permission-seed";

export default class PermissionSeeder extends MasterPermissionSeeder {
  protected module = "Permission";
  protected readonly permissions: (
    | ResourcePermissionSeed
    | PermissionSeedObject
  )[] = [
    /**
     * Base: Location
     */

    // gql.base.location.country.*
    ResourcePermissionSeed.make("gql", Country.name, "پایه - موقعیت - کشورها")
      .setModule("base")
      .setSubModule("location")
      .roles("moderator"),

    // gql.base.location.province.*
    ResourcePermissionSeed.make(
      "gql",
      Province.name,
      "پایه - موقعیت - استان‌ها",
    )
      .setModule("base")
      .setSubModule("location")
      .roles("moderator"),

    // gql.base.location.city.*
    ResourcePermissionSeed.make("gql", City.name, "پایه - موقعیت - شهرها")
      .setModule("base")
      .setSubModule("location")
      .roles("moderator"),

    // gql.base.location.area.*
    ResourcePermissionSeed.make("gql", Area.name, "پایه - موقعیت - منطقه‌ها")
      .setModule("base")
      .setSubModule("location")
      .roles("moderator"),

    /**
     * Base: Taxonomy
     */

    // gql.base.taxonomy.vocabulary.*
    ResourcePermissionSeed.make(
      "gql",
      Vocabulary.name,
      "پایه - تکسونومی - لغات",
    )
      .setModule("base")
      .setSubModule("taxonomy")
      .roles("moderator"),

    // gql.base.taxonomy.category.*
    ResourcePermissionSeed.make(
      "gql",
      Category.name,
      "پایه - تکسونومی - کتگوری",
    )
      .setModule("base")
      .setSubModule("taxonomy")
      .roles("moderator"),

    /**
     * Base: Storage
     */

    // gql.base.storage.directory.*
    ResourcePermissionSeed.make(
      "gql",
      Directory.name,
      "پایه - ذخیره‌سازی - دایرکتوری‌ها",
    )
      .setModule("base")
      .setSubModule("storage")
      .roles("moderator"),

    // gql.base.storage.file.*
    ResourcePermissionSeed.make("gql", File.name, "پایه - ذخیره‌سازی - فایل‌ها")
      .only("index", "show", "destroy")
      .setModule("base")
      .setSubModule("storage")
      .roles("moderator"),

    // rest.base.storage.file.*
    ResourcePermissionSeed.make(
      "rest",
      "file",
      "پایه - ذخیره‌سازی - فایل‌ها (وبسرویس)",
    )
      .setModule("base")
      .setSubModule("storage")
      .only("store", "update", "destroy")
      .roles("moderator"),

    // rest.base.event_tracker.*
    ResourcePermissionSeed.make("gql", "event_tracker", "پایه - رهگیری رخدادها")
      .setModule("base")
      .only("index", "show")
      .roles("moderator"),
    {
      name: "gql.base.event_tracker.report.total_events_count",
      displayName:
        "پایه - رهگیری رخدادها - گزارش: جمع تعداد رخدادهای بازه گذشته",
      subject: EventTracker.name,
      action: PermissionActionsEnum.READ,
      roleNames: ["user"],
    },
    {
      name: "gql.base.event_tracker.report.events_chart",
      displayName:
        "پایه - رهگیری رخدادها - گزارش: نمودار تعداد رخدادهای بازه گذشته",
      subject: EventTracker.name,
      action: PermissionActionsEnum.READ,
      roleNames: ["user"],
    },

    /**
     * Users
     */

    // gql.users.user.*
    ResourcePermissionSeed.make("gql", User.name, "اشخاص - کاربرها")
      .setModule("users")
      .roles("moderator"),

    // gql.users.authorization.role.*
    ResourcePermissionSeed.make("gql", Role.name, "اشخاص - نقش‌ها")
      .setModule("users")
      .setSubModule("authorization")
      .roles("moderator"),

    // gql.users.authorization.permission.*
    ResourcePermissionSeed.make("gql", Permission.name, "اشخاص - دسترسی‌ها")
      .setModule("users")
      .setSubModule("authorization")
      .roles("moderator")
      .only("index", "show", "update"),

    // gql.users.address.*
    ResourcePermissionSeed.make("gql", Address.name, "اشخاص - آدرس‌ها")
      .setModule("users")
      .roles("moderator"),

    // gql.users.contact_info.*
    ResourcePermissionSeed.make("gql", ContactInfo.name, "اشخاص - اطلاعات تماس")
      .setModule("users")
      .roles("moderator"),

    /**
     * Product
     */

    // gql.products.product.*
    ResourcePermissionSeed.make("gql", Product.name, "کالا - کالاها")
      .setModule("products")
      .roles("moderator", "product_moderator")
      .methodRoles("index", "seller"),
    {
      name: "gql.products.product.moderated_update",
      displayName: "کالا - کالاها: بروزرسانی رکورد نظارت شده",
      subject: Product.name,
      action: PermissionActionsEnum.UPDATE,
      roleNames: ["seller", "moderator", "product_moderator"],
    },

    // gql.products.offer.*
    ResourcePermissionSeed.make("gql", Offer.name, "کالا - پیشنهادها")
      .setModule("products")
      .roles("moderator", "product_moderator"),
    {
      name: "gql.products.offer.index.mine",
      displayName: "کالا - پیشنهادها: لیست رکورد خود کاربر",
      subject: Offer.name,
      action: PermissionActionsEnum.READ,
      roleNames: ["seller", "moderator"],
    },
    {
      name: "gql.products.offer.show.mine",
      displayName: "کالا - پیشنهادها: مشاهده جزئیات رکورد خود کاربر",
      subject: Offer.name,
      action: PermissionActionsEnum.READ,
      roleNames: ["seller", "moderator"],
    },
    {
      name: "gql.products.offer.store.mine",
      displayName: "کالا - پیشنهادها: ثبت رکورد خود کاربر",
      subject: Offer.name,
      action: PermissionActionsEnum.CREATE,
      roleNames: ["seller", "moderator"],
    },
    {
      name: "gql.products.offer.update.mine",
      displayName: "کالا - پیشنهادها: بروزرسانی رکورد خود کاربر",
      subject: Offer.name,
      action: PermissionActionsEnum.UPDATE,
      roleNames: ["seller", "moderator"],
    },

    // gql.products.attribute.*
    ResourcePermissionSeed.make("gql", Attribute.name, "کالا - خصوصیت‌ها")
      .setModule("products")
      .roles("moderator", "product_moderator"),

    // gql.products.brand.*
    ResourcePermissionSeed.make("gql", Brand.name, "کالا - برندها")
      .setModule("products")
      .roles("moderator", "product_moderator"),

    // gql.products.uom.*
    ResourcePermissionSeed.make("gql", Uom.name, "کالا - واحدهای اندازه‌گیری")
      .setModule("products")
      .roles("moderator", "product_moderator"),

    // gql.products.price.*
    ResourcePermissionSeed.make("gql", Price.name, "کالا - قیمت‌ها")
      .setModule("products")
      .roles("moderator", "product_moderator"),

    // gql.products.attribute_value.*
    ResourcePermissionSeed.make(
      "gql",
      AttributeValue.name,
      "کالا - مقدار خصوصیت‌ها",
    )
      .setModule("products")
      .roles("moderator", "product_moderator"),

    // gql.products.image.*
    ResourcePermissionSeed.make("gql", Image.name, "کالا - تصویرها")
      .setModule("products")
      .roles("moderator", "product_moderator"),

    // gql.products.seller.*
    ResourcePermissionSeed.make("gql", Seller.name, "کالا - فروشنده‌ها")
      .setModule("products")
      .roles("moderator", "product_moderator"),
    {
      name: "gql.products.seller.moderated_create",
      displayName: "کالا - فروشنده‌ها: ثبت رکورد نظارت شده",
      subject: Seller.name,
      action: PermissionActionsEnum.CREATE,
      roleNames: ["user"],
    },
    {
      name: "gql.products.seller.mine",
      displayName: "کالا - فروشنده‌ها: جزئیات رکورد مربوط به کاربر",
      subject: Seller.name,
      action: PermissionActionsEnum.CREATE,
      roleNames: ["user"],
    },

    // gql.products.sellerـrepresentative.*
    ResourcePermissionSeed.make(
      "gql",
      SellerRepresentative.name,
      "کالا - فروشنده‌ها - نماینده‌ها",
    )
      .setModule("products")
      .roles("moderator"),

    /**
     * Other
     */
    {
      name: "dashboard.index",
      displayName: "داشبور کاربری",
      subject: null,
      action: PermissionActionsEnum.READ,
      roleNames: ["user"],
    },
  ];
}
