import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { Seller } from "src/products/seller/entities/seller.entity";
import { ContactInfo } from "src/users/contact-info/entities/contact-info.entity";
import { ContactInfoRelatedTypes } from "src/users/contact-info/enums/contact-info-related-types.enum";
import { ContactInfoTypes } from "src/users/contact-info/enums/contact-info-types.enum";
import { User } from "src/users/user/entities/user.entity";
import { DataSource } from "typeorm";
import { PreOrderStatus } from "../enums/pre-order-states.enum";
import { TypeOrderOffer } from "../enums/type-order-offer.enum";
import { Line } from "../line/entities/order-line.entity";
import { AddSellerOrderOffer } from "./dto/add-seller-offer.input";
import { CreateLineOfferInput } from "./dto/create-line-offer.input";
import { CreateOrderOfferInput } from "./dto/create-order-offer.input";
import { UpdateOrderOfferInput } from "./dto/update-order-offer.input";
import { OfferLine } from "./entities/offer-line.entity";
import { OfferOrder } from "./entities/order-offer.entity";
import { OrderOfferStatuses } from "./enums/order-offer-statuses";
import { SellerType } from "src/products/seller/enums/seller-type.enum";
import { PaginationOrderOfferResponse } from "./dto/pagination-order-offer.responde";
import { IndexPreOrderInput } from "../preOrder/dto/index-preOrder.input";
import { Address } from "src/users/address/entities/address.entity";
import { AddressRelatedTypes } from "src/users/address/enums/address-related-types.enum";
import { AuthorizationService } from "src/users/authorization/authorization.service";
import { SellerRepresentative } from "src/products/seller/entities/seller-representative.entity";
import { Country } from "src/base/location/country/entities/country.entity";
import { City } from "src/base/location/city/entities/city.entity";
import { Province } from "src/base/location/province/entities/province.entity";

@Injectable()
export class OrderOfferService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private authorizationService: AuthorizationService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async generateNumericUuid(length: number = 5): Promise<string> {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  async addSellerOrderOffer(
    addSellerOrderOffer: AddSellerOrderOffer,
    user: User,
  ) {
    try {
      const findTempSeller = await Seller.findOneBy({
        name: `${addSellerOrderOffer.seller_name} | ${addSellerOrderOffer.company_name}`,
      });

      const offer = await OfferOrder.findOne({
        where: { id: addSellerOrderOffer.orderOfferId },
        relations: ["offerLine"],
        order: {
          id: "DESC",
        },
      });
      if (!findTempSeller) {
        const seller: Seller = new Seller();
        seller.name = `${addSellerOrderOffer.seller_name} | ${addSellerOrderOffer.company_name}`;
        seller.sellerType = SellerType.EXTENDED;
        seller.createdById = user.id;
        await seller.save();
        const PhoneContact = new ContactInfo();
        PhoneContact.relatedId = await seller.id;
        PhoneContact.relatedType = ContactInfoRelatedTypes.SELLER;
        PhoneContact.title = "تلفن";
        PhoneContact.type = ContactInfoTypes.TEL;

        PhoneContact.number = addSellerOrderOffer.phone;
        await PhoneContact.save();
        const CellContact = new ContactInfo();
        CellContact.relatedType = ContactInfoRelatedTypes.SELLER;
        CellContact.relatedId = await seller.id;
        CellContact.title = "موبایل";
        CellContact.type = ContactInfoTypes.MOBILE;
        CellContact.number = addSellerOrderOffer.cellphone;

        await CellContact.save();
        const address = new Address();
        address.relatedType = AddressRelatedTypes.SELLER;
        address.countryId = Country.IR;
        address.address = addSellerOrderOffer.address;
        address.cityId = City.TEHRAN;
        address.relatedId = await seller.id;
        address.relatedId = await seller.id;
        address.title = "آدرس";
        address.provinceId = Province.TEHRAN;
        await address.save();
        offer.sellerId = await seller.id;
        offer.request_name = seller.name;
      } else {
        offer.sellerId = findTempSeller.id;
        offer.request_name = findTempSeller.name;
      }

      offer.status = OrderOfferStatuses.PENDING_PRICE;
      offer.type = TypeOrderOffer.SELLER;

      await offer.save();

      return offer;
    } catch (e) {
      console.log("err in addSellerOrderOffer", e);
    }
  }
  async createOffer(
    createOrderOfferInput: CreateOrderOfferInput,
    user: User,
    admin: boolean,
    client: boolean,
  ): Promise<OfferOrder> {
    try {
      const maxPendingInfoOrders = 5;

      const find_offer = await OfferOrder.find({
        where: {
          userId: user.id,
          preOrder: {
            id: createOrderOfferInput.preOrderId,
          },
          status: OrderOfferStatuses.PENDING_INFO,
        },
        relations: ["offerLine"],
        order: {
          id: "DESC",
        },
        take: maxPendingInfoOrders + 1,
      });

      if (find_offer.length > maxPendingInfoOrders) {
        return find_offer[0];
      }
      const new_offer: OfferOrder = OfferOrder.create<OfferOrder>(
        createOrderOfferInput,
      );

      new_offer.userId = user.id;
      new_offer.type = admin
        ? TypeOrderOffer.VARDAST
        : client
        ? TypeOrderOffer.CLIENT
        : new_offer.type;
      new_offer.uuid = await this.generateNumericUuid();
      new_offer.created_at = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Tehran",
      });
      new_offer.request_name = user.fullName ?? "کاربر وردست";

      const userAuth = await this.authorizationService.setUser(user);

      if (userAuth.hasRole("seller")) {
        new_offer.sellerId = (
          await SellerRepresentative.findOneBy({ userId: user.id })
        ).sellerId;
      }

      if (!admin && !userAuth.hasRole("admin")) {
        new_offer.status = OrderOfferStatuses.PENDING_PRICE;
      }

      await new_offer.save();
      const preOrder = await new_offer.preOrder;
      if (preOrder) {
        preOrder.offersNum += 1;

        await preOrder.save();
      }

      const offer = await OfferOrder.findOne({
        where: { id: new_offer.id },
        relations: ["offerLine"],
        order: {
          id: "DESC",
        },
      });
      offer.total = "0";
      offer.total_tax = "0";
      offer.total_fi = "0";
      const lines = await (await offer.preOrder).lines;
      lines.map(async line => {
        const newOfferLine = new OfferLine();
        newOfferLine.userId = user.id;
        newOfferLine.total_price = "0";
        newOfferLine.fi_price = "0";
        newOfferLine.tax_price = "0";
        newOfferLine.offerOrderId = new_offer.id;
        newOfferLine.lineId = line.id;

        await newOfferLine.save();
      });

      return offer;
    } catch (error) {
      console.log("createOffer err", error);
    }
  }
  convertPersianToEnglish(str) {
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    const englishDigits = "0123456789";
    return str.replace(
      /[۰-۹]/g,
      char => englishDigits[persianDigits.indexOf(char)],
    );
  }
  async calculatePriceOfferLine(
    lineId: number,
    fi_price: string,
    with_tax: boolean,
  ) {
    fi_price = this.convertPersianToEnglish(fi_price);

    if (fi_price === "0") {
      return {
        fi_price: "0",
        tax_price: "0",
        total_price: "0",
      };
    }

    const line = await Line.findOneBy({ id: lineId });
    if (line) {
      const fiPrice = parseFloat(fi_price);
      const qty = parseInt(line.qty, 10);

      const taxPrice = Math.round(fiPrice * qty * 0.1);
      const totalPriceWithTax = Math.round(fiPrice * qty * 1.1);
      const totalPrice = Math.round(fiPrice * qty);

      return {
        fi_price: fi_price,
        tax_price: with_tax ? taxPrice.toString() : "0",
        total_price: with_tax
          ? totalPriceWithTax.toString()
          : totalPrice.toString(),
      };
    }
  }
  async findOfferLine(
    createLineOfferInput: CreateLineOfferInput,
    user: User,
  ): Promise<OfferLine | null> {
    const findOptions = {
      offerOrderId: createLineOfferInput.offerId,
      lineId: createLineOfferInput.lineId,
    };
    if (!(await this.authorizationService.setUser(user).hasRole("admin"))) {
      findOptions["userId"] = user.id;
    }
    return await OfferLine.findOneBy(findOptions);
  }
  async updateOfferLineAndOrder(
    offer: OfferOrder,
    offerLine: OfferLine,
    createLineOfferInput: CreateLineOfferInput,
  ): Promise<void> {
    const {
      id,
      total_price: lastTotal,
      fi_price: lastFi,
      tax_price: lastTax,
    } = offerLine;

    const newOfferLineData = {
      id,
      ...createLineOfferInput,
    };

    const updatedOfferLine = await OfferLine.preload(newOfferLineData);

    offer.total = (
      parseInt(offer.total) +
      parseInt(createLineOfferInput.total_price) -
      parseInt(lastTotal)
    ).toString();

    offer.total_tax = (
      parseInt(offer.total_tax) +
      parseInt(createLineOfferInput.tax_price) -
      parseInt(lastTax)
    ).toString();

    offer.total_fi = (
      parseInt(offer.total_fi) +
      parseInt(createLineOfferInput.fi_price) -
      parseInt(lastFi)
    ).toString();

    await Promise.all([offer.save(), updatedOfferLine.save()]);
  }
  async createOrderOfferLine(
    createLineOfferInput: CreateLineOfferInput,
    user: User,
  ): Promise<OfferOrder> {
    try {
      const offerLine = await this.findOfferLine(createLineOfferInput, user);

      const offer = await OfferOrder.findOne({
        where: { id: createLineOfferInput.offerId },
        relations: ["offerLine"],
        order: { id: "DESC" },
      });

      if (!offer) {
        throw new Error(
          `OfferOrder with ID ${createLineOfferInput.offerId} not found`,
        );
      }

      if (offerLine) {
        await this.updateOfferLineAndOrder(
          offer,
          offerLine,
          createLineOfferInput,
        );
      }

      return offer;
    } catch (error) {
      console.error("createOffer error:", error);
      throw error;
    }
  }

  async removeOrderOfferLine(id: number): Promise<OfferOrder> {
    try {
      const OfferOrderLine: OfferLine = await OfferLine.findOne({
        where: { id: id },
      });
      if (!OfferOrderLine) {
        throw new Error("Not Found Offer Order");
      }

      const offerOrderId = OfferOrderLine.offerOrderId;

      await OfferOrderLine.remove();

      const offerOrder = await OfferOrder.findOne({
        where: { id: offerOrderId },
        relations: ["offerLine"],
        order: {
          id: "DESC",
        },
      });
      return offerOrder;
    } catch (error) {
      console.log("removeOrderOfferLine err", error);
    }
  }
  async preOrderOffers(
    indexPreOrderInput: IndexPreOrderInput,
  ): Promise<PaginationOrderOfferResponse> {
    try {
      indexPreOrderInput?.boot();
      const { take, skip } = indexPreOrderInput || {};

      const [data, total] = await OfferOrder.findAndCount({
        skip,
        take,
        where: {
          status: OrderOfferStatuses.INVOICE,
        },
        order: {
          id: "DESC",
        },
      });

      return PaginationOrderOfferResponse.make(indexPreOrderInput, total, data);
    } catch (error) {
      console.log("preOrderOffers err", error);
    }
  }
  async updateOrderOffer(
    updateOrderOfferInput: UpdateOrderOfferInput,
  ): Promise<OfferOrder> {
    try {
      const offerOrder = await OfferOrder.findOne({
        where: { id: updateOrderOfferInput.id },
        relations: ["offerLine"],
        order: {
          id: "DESC",
        },
      });
      offerOrder.status =
        (updateOrderOfferInput.status as OrderOfferStatuses) ??
        OrderOfferStatuses.PENDING_PRICE;
      await offerOrder.save();
      if (updateOrderOfferInput.status === OrderOfferStatuses.CLOSED) {
        const preOrder = await offerOrder.preOrder;
        if (preOrder) {
          preOrder.status = PreOrderStatus.CLOSED;
          await preOrder.save();
        } else {
          throw new Error("PreOrder not found for this OfferOrder");
        }
      }
      return offerOrder;
    } catch (error) {
      console.log("updateOrderOffer err", error);
    }
  }

  async getOffer(id: number): Promise<OfferOrder> {
    try {
      const orderOffer: OfferOrder = await OfferOrder.findOne({
        where: { id },
        relations: ["offerLine"],
        order: {
          offerLine: {
            id: "DESC",
          },
        },
      });
      return orderOffer;
    } catch (error) {
      throw error;
    }
  }
}
