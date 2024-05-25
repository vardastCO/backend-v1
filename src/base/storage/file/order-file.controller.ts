import { Controller, Get, Res, Param, } from "@nestjs/common";
import { Response } from "express";
import { Public } from "src/users/auth/decorators/public.decorator";
import axios from 'axios';
import { OfferOrder } from "src/order/orderOffer/entities/order-offer.entity";
import { PreOrder } from "src/order/preOrder/entities/pre-order.entity";
import { addCommas,numberToWords } from "@persian-tools/persian-tools";
@Controller("order/file")
export class OrderFileController {
  @Public()
  @Get(':uuid')
  async getOrderFiles(@Param("uuid") uuid: string, @Res() res: Response): Promise<void> {
  
    const templateURL = 'https://storage.vardast.com/vardast/order/invoice-template.html';

    try {
      const response = await axios.get(templateURL);
      const template = response.data;
      const preResult = await PreOrder.findOneBy({
        uuid:uuid
      })
      if (!preResult) {
        res.send('not found')
      }
      const result = await OfferOrder.findOne({
        where: { id: 1},
        relations: ["preOrder.user","preOrder.address","offerLine"],
      })
      const items = await Promise.all((await result.offerLine).map(async (offer) => ({
        name: (await offer.line).item_name,
        description: '',
        uom: (await offer.line).uom,
        qty: (await offer.line).qty,
        unitPrice: offer.fi_price,
        tax_price: offer.tax_price,
        totalPrice: offer.total_price,
    })));
  
      const data = {
        date: (await result.preOrder).request_date,
        invoiceNumber: (await result.preOrder).uuid,
        sellerAddress: 'بلوار کاوه، نرسیده به خیابان دولت، نبش کوچه اخلاقی غربی، پلاك 12,1 طبقه 2 واحد 4',
        sellerNationalId: '14011385876',  
        buyerName: (await (await result.preOrder).address).delivery_name,
        buyerNationalId: (await (await result.preOrder).address).delivery_contact,
        buyerAddress: (await (await result.preOrder).address).address,
        items: await items,
        totalAmount: result.total,
        instructions: 'خواهشمند است مبلغ فاکتور را به شماره شباي 530780100610810707075859 IR به نام شرکت خلق ارزش مهستان واریز فرمایید.'
      };
      // Inject dynamic data into the template
      const invoiceHTML = this.injectDataIntoTemplate(template, data);

      // Set the response headers and send the HTML
      res.setHeader('Content-Type', 'text/html');
      res.send(invoiceHTML);
    } catch (error) {
      console.error('Failed to fetch invoice template:', error);
      throw new Error('Failed to fetch invoice template');
    }
  }

  private injectDataIntoTemplate(template: string, data: any): string {
    const { date, invoiceNumber, sellerAddress, sellerNationalId, buyerName, buyerNationalId, buyerAddress, items, totalAmount, additions, discount, grandTotal, instructions } = data;
    const itemsHTML = items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.description}</td>
        <td>${item.uom}</td>
        <td>${item.qty}</td>
        <td>${addCommas(item.unitPrice)}</td>
        <td>${addCommas(item.tax_price)}</td>
        <td>${addCommas(item.totalPrice)}</td>
      </tr>`).join('');
    const persianTotal = numberToWords(addCommas(totalAmount))

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
                   .replace('{{grandTotal}}', grandTotal)
                   .replace('{{persianTotal}}', `${persianTotal}`)
                   .replace('{{instructions}}', instructions);
  }
}
