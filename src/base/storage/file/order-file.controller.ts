import { Controller, Get, Res, Param, ParseFilePipeBuilder, } from "@nestjs/common";
import { Response } from "express";
import { Public } from "src/users/auth/decorators/public.decorator";
import axios from 'axios';
import { OfferOrder } from "src/order/orderOffer/entities/order-offer.entity";
import { PreOrder } from "src/order/preOrder/entities/pre-order.entity";
import { addCommas,numberToWords } from "@persian-tools/persian-tools";
import { PreOrderStatus } from "src/order/enums/pre-order-states.enum";
import { OrderOfferStatuses } from "src/order/orderOffer/enums/order-offer-statuses";
import {  Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CsvParser } from 'nest-csv-parser';
import { Readable } from 'stream';
import { UserDto } from "./dto/order-csv.dto";
@Controller("order/file")
export class OrderFileController {
  constructor(private readonly csvParser: CsvParser) {}
  @Public()
  @Get(':uuid')
  async getOrderFiles(@Param("uuid") uuid: string, @Res() res: Response): Promise<void> {
  
    const templateURL = 'https://storage.vardast.com/vardast/order/invoice-template.html';

    try {
      const response = await axios.get(templateURL);
      const template = response.data;
      const order = await PreOrder.findOneBy({
        uuid,
        status: PreOrderStatus.CLOSED
      })

      if (!order) {
        res.send('not found')
      }

      const offer = await OfferOrder.findOne({
        where: {
          preOrderId: order.id ,
          status : OrderOfferStatuses.CLOSED
        },
        relations: ["preOrder.user","preOrder.address","offerLine"],
      })
      if (!offer) {
        res.send('not found')
      }
      const items = await Promise.all((await offer.offerLine).map(async (offer) => ({
        id:(await offer.line).id,
        name: (await offer.line).item_name,
        description: '',
        uom: (await offer.line).uom ?? 'عدد',
        qty: (await offer.line).qty,
        unitPrice: offer.fi_price,
        tax_price: offer.tax_price,
        totalPrice: offer.total_price,
    })));
  
      const data = {
        date: new Date((await offer.preOrder).request_date).toLocaleDateString('fa-IR'),
        invoiceNumber: (await offer.preOrder).uuid,
        sellerAddress: 'بلوار کاوه، نرسیده به خیابان دولت، نبش کوچه اخلاقی غربی، پلاك 12,1 طبقه 2 واحد 4',
        sellerNationalId: '14011385876',  
        buyerName: (await (await offer.preOrder).address).delivery_name,
        buyerNationalId: (await (await offer.preOrder).address).delivery_contact,
        buyerAddress: (await (await offer.preOrder).address).address,
        items: await items,
        totalAmount: offer.total,
        instructions: 'خواهشمند است مبلغ فاکتور را به شماره شباي 530780100610810707075859 IR به نام شرکت خلق ارزش مهستان واریز فرمایید.',
        instructions2: 'کالای فروخته شده و تحویل داده شده توسط فروشنده به شرح جدول فوق تا زمان تسویه حساب کامل به صورت امانت نزد خریدار می باشد.'
      
      
      };
      const invoiceHTML = this.injectDataIntoTemplate(template, data);

      res.setHeader('Content-Type', 'text/html');
      res.send(invoiceHTML);
    } catch (error) {
      console.error('Failed to fetch invoice template:', error);
      throw new Error('Failed to fetch invoice template');
    }
  }
  @Post('csv')
  @UseInterceptors(FileInterceptor("file"))
  async uploadCsv(
    @UploadedFile(
    new ParseFilePipeBuilder()
      .addFileTypeValidator({
        fileType:
          /csv/,
      })
      .addMaxSizeValidator({ maxSize: 50 * 1_000_000 }) // 50MB
      .build({ fileIsRequired: true }),
  )
  file: Express.Multer.File,) {
    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);
    
    
    const entities = await this.csvParser.parse(bufferStream, UserDto);
    try {
      const transformedResults = entities.list.map(itemString => {
        // Split the CSV-like string into individual fields
        const fields = itemString.split(',');
      
        // Create a transformed object by mapping fields to their respective properties
        return {
          name: fields[0]?.trim() || '', // Accessing the first field as 'name'
          date: fields[1]?.trim() || '', // Accessing the second field as 'date'
          unit: fields[2]?.trim() || '', // Accessing the third field as 'unit'
          // Add more fields as needed based on your data structure
        };
      });
      
      console.log('Transformed results:', transformedResults); // Log the transformed results
      
      return transformedResults;
      
    } catch (e) {
      console.log('lll',e)
    }

   

  }
  
  private injectDataIntoTemplate(template: string, data: any): string {
    const { date, invoiceNumber, sellerAddress, sellerNationalId, buyerName, buyerNationalId, buyerAddress, items, totalAmount, additions, discount, grandTotal, instructions2,instructions } = data;
    const itemsHTML = items.map((item, index) => `
      <tr>
        <td>${index+1}</td>
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
      </tr>`).concat([...Array(10 - items.length+1)].map((_,item) => `
      <tr>
        <td>${item+items.length}</td>
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
      </tr>`)).join('');
    const persianTotal = numberToWords(addCommas(totalAmount *  10))

    return template.replace('{{date}}', date)
                   .replace('{{invoiceNumber}}', invoiceNumber)
                   .replace('{{sellerAddress}}', sellerAddress)
                   .replace('{{sellerNationalId}}', sellerNationalId)
                   .replace('{{buyerName}}', buyerName)
                   .replace('{{buyerNationalId}}', buyerNationalId)
                   .replace('{{buyerAddress}}', buyerAddress)
                   .replace('{{itemsHTML}}', itemsHTML)
                   .replace('{{totalAmount}}', addCommas(totalAmount))
                   .replace('{{additions}}', additions)
                   .replace('{{discount}}', discount)
                   .replace('{{buyerNationalId}}', '1111111')
                   .replace('{{buyerPhone}}', '09124484707')
                    .replace('{{grandTotal}}', grandTotal)
                    .replace('{{totalUOM}}', '0')
                    .replace('{{totalFi}}', '0')
                    .replace('{{totalTAX}}', '0')
                   .replace('{{persianTotal}}', `${persianTotal}`)
                  .replace('{{instructions}}', instructions)
                  .replace('{{instructions2}}', instructions2);
  }
}
