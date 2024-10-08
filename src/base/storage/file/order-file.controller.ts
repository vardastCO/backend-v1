import {
  Controller,
  Get,
  Res,
  Param,
  ParseFilePipeBuilder,
} from "@nestjs/common";
import { Response } from "express";
import { Public } from "src/users/auth/decorators/public.decorator";
import axios from "axios";
import { OfferOrder } from "src/order/orderOffer/entities/order-offer.entity";
import { PreOrder } from "src/order/preOrder/entities/pre-order.entity";
import { addCommas, numberToWords } from "@persian-tools/persian-tools";
import { PreOrderStatus } from "src/order/enums/pre-order-states.enum";
import { OrderOfferStatuses } from "src/order/orderOffer/enums/order-offer-statuses";
import { Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { CsvParser } from "nest-csv-parser";
import { Readable } from "stream";
import { UserDto } from "./dto/order-csv.dto";
import { Line } from "src/order/line/entities/order-line.entity";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { User } from "src/users/user/entities/user.entity";
@Controller("order/file")
export class OrderFileController {
  constructor(private readonly csvParser: CsvParser) {}
  @Public()
  @Get(":uuid")
  async getOrderFiles(
    @Param("uuid") uuid: string,
    @Res() res: Response,
  ): Promise<void> {
    const templateURL =
      "https://storage.vardast.com/vardast/order/invoice-template.html";

    try {
      const response = await axios.get(templateURL);
      const template = response.data;

      const order = await PreOrder.findOneBy({
        uuid,
        status: PreOrderStatus.CLOSED,
      });

      if (!order) {
        res.send("not found pre order");
      }

      const offer = await OfferOrder.findOne({
        where: {
          preOrderId: order.id,
          status: OrderOfferStatuses.CLOSED,
        },
        relations: ["preOrder.user", "preOrder.address", "offerLine"],
      });
      if (!offer) {
        res.send("not found offer");
      }
      const items = await Promise.all(
        (
          await offer.offerLine
        ).map(async offer => ({
          id: (await offer.line).id,
          name: (await offer.line).item_name,
          description: "",
          uom: (await offer.line).uom ?? "عدد",
          qty: (await offer.line).qty,
          unitPrice: offer.fi_price,
          tax_price: offer.tax_price,
          totalPrice: offer.total_price,
        })),
      );

      const data = {
        date: new Date((await offer.preOrder).request_date).toLocaleDateString(
          "fa-IR",
        ),
        invoiceNumber: (await offer.preOrder).uuid,
        sellerAddress:
          "بلوار کاوه، نرسیده به خیابان دولت، نبش کوچه اخلاقی غربی، پلاك 12,1 طبقه 2 واحد 4",
        sellerNationalId: "14011385876",
        buyerName: (await (await offer.preOrder).address).delivery_name,
        buyerNationalId: (await (await offer.preOrder).address)
          .delivery_contact,
        buyerAddress: (await (await offer.preOrder).address).address,
        items: await items,
        totalAmount: offer.total,
        instructions:
          "خواهشمند است مبلغ فاکتور را به شماره شباي 530780100610810707075859 IR به نام شرکت خلق ارزش مهستان واریز فرمایید.",
        instructions2:
          "کالای فروخته شده و تحویل داده شده توسط فروشنده به شرح جدول فوق تا زمان تسویه حساب کامل به صورت امانت نزد خریدار می باشد.",
      };
      const invoiceHTML = this.injectDataIntoTemplate(template, data);

      res.setHeader("Content-Type", "text/html");
      res.send(invoiceHTML);
    } catch (error) {
      console.error("Failed to fetch invoice template:", error);
      throw new Error("Failed to fetch invoice template");
    }
  }
  @Post("line/:id")
  @UseInterceptors(FileInterceptor("file"))
  async uploadCsv(
    @Param("id") id: string,
    @CurrentUser() user: User,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /csv/,
        })
        .addMaxSizeValidator({ maxSize: 50 * 1_000_000 }) // 50MB
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
  ) {
    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);

    const entities = await this.csvParser.parse(bufferStream, UserDto);
    try {
      entities.list.map(async item => {
        // console.log('item',item)
        // Extract the key dynamically
        const itemKey = Object.keys(item)[0];
        // console.log('kkk',itemKey)
        const valuesString = item[itemKey];
        // console.log('valuesString',valuesString)
        // Split the values into an array
        const values = valuesString.split(",");
        // console.log('values',values)
        // Ensure there are enough fields before accessing them
        if (values.length > 13) {
          const line = new Line();
          line.preOrderId = parseInt(id);
          line.userId = user.id;
          line.item_name = values[10]; // عنوان قلم خریدنی
          line.qty = values[12]; // مقدار
          line.uom = values[13]; // واحد
          await line.save();
          const pre_order = await PreOrder.findOneBy({
            id: parseInt(id),
          });
          const tehranTime = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Tehran",
          });
          const currentDate = new Date(tehranTime);

          // Convert the date to Persian date format
          const persianDate = currentDate.toLocaleDateString("fa-IR");

          // Split the Persian date string to extract year, month, and day
          const [persianYear, persianMonth, persianDay] =
            persianDate.split("/");

          // Get the month number (already in Persian calendar format)
          const persianMonthNumber = parseInt(persianMonth, 10);

          // Use the month number as needed
          const shamsiMonthString = persianMonthNumber.toString();
          const valueString = values[0].toString();

          const concatenatedString = "3" + "5" + valueString;
          pre_order.uuid = concatenatedString;
          await pre_order.save();
        }

        return;
      });

      return true;
    } catch (e) {
      console.log("create line by csv ", e);
      return false;
    }
  }

  private injectDataIntoTemplate(template: string, data: any): string {
    try {
      const {
        date,
        invoiceNumber,
        sellerAddress,
        sellerNationalId,
        buyerName,
        buyerNationalId,
        buyerAddress,
        items,
        totalAmount,
        additions,
        discount,
        grandTotal,
        instructions2,
        instructions,
      } = data;
      const itemsHTML = items
        .map(
          (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td colspan="2">${item.id}</td>
          <td colspan="5">${item.name}</td>
          <td>${item.uom}</td>
          <td>${item.qty}</td>
          <td colspan="2">${addCommas(item.unitPrice * 10)}</td>
          <td colspan="2"></td>
          <td colspan="2"></td>
          <td colspan="2"></td>
          <td colspan="2"></td>
          <td colspan="2">${addCommas(item.tax_price * 10)}</td>
          <td colspan="2">${addCommas(item.totalPrice * 10)}</td>
        </tr>`,
        )
        .concat(
          [...Array(Math.max(10 - items.length + 1, 0))].map(
            (_, index) => `
        <tr>
          <td>${index + items.length}</td>
          <td colspan="2"></td>
          <td colspan="5"></td>
          <td></td>
          <td></td>
          <td colspan="2"></td>
          <td colspan="2"></td>
          <td colspan="2"></td>
          <td colspan="2"></td>
          <td colspan="2"></td>
          <td colspan="2"></td>
          <td colspan="2"></td>
        </tr>`,
          ),
        )
        .join("");
      const persianTotal = numberToWords(addCommas(totalAmount * 10));

      return template
        .replace("{{date}}", date)
        .replace("{{invoiceNumber}}", invoiceNumber)
        .replace("{{sellerAddress}}", sellerAddress)
        .replace("{{sellerNationalId}}", sellerNationalId)
        .replace("{{buyerName}}", buyerName)
        .replace("{{buyerNationalId}}", buyerNationalId)
        .replace("{{buyerAddress}}", buyerAddress)
        .replace("{{itemsHTML}}", itemsHTML)
        .replace("{{totalAmount}}", addCommas(totalAmount))
        .replace("{{additions}}", additions)
        .replace("{{discount}}", discount)
        .replace("{{buyerNationalId}}", "1111111")
        .replace("{{buyerPhone}}", "09124484707")
        .replace("{{grandTotal}}", grandTotal)
        .replace("{{totalUOM}}", "0")
        .replace("{{totalFi}}", "0")
        .replace("{{totalTAX}}", "0")
        .replace("{{persianTotal}}", `${persianTotal}`)
        .replace("{{instructions}}", instructions)
        .replace("{{instructions2}}", instructions2);
    } catch (e) {
      console.log("eee", e);
    }
  }
}
