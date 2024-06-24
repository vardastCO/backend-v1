import { Controller, Get, Param, Res } from "@nestjs/common";
import { addCommas, numberToWords } from "@persian-tools/persian-tools";
import axios from 'axios';
import { Response } from "express";
import { TypeOrderOffer } from "src/order/enums/type-order-offer.enum";
import { OfferOrder } from "src/order/orderOffer/entities/order-offer.entity";
import { TypeOrder } from "src/order/preOrder/enum/type-order.enum";
import { Address } from "src/users/address/entities/address.entity";
import { Public } from "src/users/auth/decorators/public.decorator";
import { Legal } from "src/users/legal/entities/legal.entity";
import { UserProject } from "src/users/project/entities/user-project.entity";
import { UserTypeProject } from "src/users/project/enums/type-user-project.enum";
@Controller("pre/order/file")
export class PreOrderFileController {
  @Public()
  @Get(':uuid')
  async getOrderFiles(@Param("uuid") uuid: string, @Res() res: Response): Promise<void> {
    let template
    const templateURL = 'https://storage.vardast.com/vardast/order/pre-invoice-template.html';
    try {
      const response = await axios.get(templateURL);
       template = response.data;
      // Further processing
    } catch (error) {
      console.error('Failed to fetch invoice template:', error);
      res.status(500).send('Failed to fetch invoice template');
      return; 
    }
    
    try {

      const offer = await OfferOrder.findOne({
        where: {
          uuid ,
        },
        relations: ["preOrder.user","preOrder.address","offerLine","preOrder.project"],
      })

      if (!offer) {
        res.send('not found')
      }

      let legal = null
      let address_legal = null
      if ((await offer.preOrder).type = TypeOrder.LEGAL) {
        const user_manager = await UserProject.findOneBy({
          projectId: (await offer.preOrder).projectId,
          type:UserTypeProject.MANAGER
        })
        legal = await Legal.findOneBy({
          ownerId:user_manager.id
        })
        address_legal = await Address.findOneBy({
          relatedId:legal.id
        })
      }
      let totalQty = 0;
      const items = await Promise.all((await offer.offerLine).map(async (offer) => {
        const data = {
          id:(await offer.line).id,
          name: (await offer.line).item_name,
          description: '',
          uom: (await offer.line).uom ?? 'عدد',
          qty: (await offer.line).qty ?? '-',
          unitPrice: offer.fi_price ?? '-',
          tax_price: offer.tax_price ?? '-',
          totalPrice: offer.total_price ?? '-',
        }
        totalQty += parseInt(data.qty, 10);
        return data;
       }));
      const expire_time = new Date(await (await offer.preOrder).expire_time).toLocaleDateString('fa-IR')
      const data = {
        date: new Date((await offer.preOrder).request_date).toLocaleDateString('fa-IR'),
        invoiceNumber: (await offer.preOrder).uuid,
        sellerAddress: 'بلوار کاوه، نرسیده به خیابان دولت، نبش کوچه اخلاقی غربی، پلاك 12,1 طبقه 2 واحد 4',
        sellerNationalId: '14011385876',  
        buyerName: legal.length > 0 ? legal.name_company : (await (await offer.preOrder).address).delivery_name,
        buyerNationalId:legal.length > 0 ? legal.national_id : '-',
        buyerAddress: legal.length > 0 ? address_legal?.address : (await (await offer.preOrder).address).address,
        items: await items,
        totalAmount: offer.total,
        totalTax: offer.total_tax,
        totalFi: offer.total_fi,
        instructions: 'خواهشمند است مبلغ فاکتور را به شماره شباي 530780100610810707075859 IR به نام شرکت خلق ارزش مهستان واریز فرمایید.',
        instructions2: 'کالای فروخته شده و تحویل داده شده توسط فروشنده به شرح جدول فوق تا زمان تسویه حساب کامل به صورت امانت نزد خریدار می باشد.',
        instructions3: `تاریخ انقضا ی سفارش ${expire_time} ثبت شده است `,
        totalQty

      };
      const invoiceHTML = this.injectDataIntoTemplate(template, data);

      res.setHeader('Content-Type', 'text/html');
      res.send(invoiceHTML);
    } catch (error) {
      console.error('Failed to fetch invoice template:', error);
      throw new Error('Failed to fetch invoice template');
    }
  }

  private injectDataIntoTemplate(template: string, data: any): string {
    const { date, invoiceNumber, totalQty, sellerAddress,instructions3, sellerNationalId,totalTax,totalFi, buyerName, buyerNationalId, buyerAddress, items, totalAmount, additions, discount, grandTotal, instructions2,instructions } = data;
    const itemsHTML = items.map((item, index) => `
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
      </tr>`).join('');

    const remainingRows = Math.max(0, 10 - items.length);
    const additionalRowsHTML = [...Array(remainingRows)].map(() => `
      <tr>
        <td></td>
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
      </tr>`).join('');

    const fullItemsHTML = itemsHTML + additionalRowsHTML;

    const persianTotal = numberToWords(addCommas(totalAmount * 10));

    return template.replace('{{date}}', date)
                   .replace('{{invoiceNumber}}', invoiceNumber)
                   .replace('{{sellerAddress}}', sellerAddress)
                   .replace('{{sellerNationalId}}', sellerNationalId)
                   .replace('{{buyerName}}', buyerName)
                   .replace('{{buyerNationalId}}', buyerNationalId)
                   .replace('{{buyerAddress}}', buyerAddress)
                   .replace('{{itemsHTML}}', fullItemsHTML)
                   .replace('{{totalAmount}}', addCommas(totalAmount))
                   .replace('{{additions}}', additions)
                   .replace('{{discount}}', discount)
                   .replace('{{buyerNationalId}}', '1111111')
                   .replace('{{buyerPhone}}', '09124484707')
                    .replace('{{grandTotal}}', grandTotal)
                    .replace('{{totalUOM}}', totalQty)
                    .replace('{{totalFi}}',  addCommas(totalFi))
                    .replace('{{totalTAX}}', addCommas(totalTax))
                    .replace('{{persianTotal}}', `${persianTotal}`)
                    .replace('{{instructions_sheba}}', instructions)
                    .replace('{{instructions_expire}}', instructions2)
                    .replace('{{instructions_expire_time}}', instructions3);
  }
}
