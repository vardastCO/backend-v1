import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { Public } from "src/users/auth/decorators/public.decorator";
import axios from 'axios';
import * as pdf from 'html-pdf';

@Controller("order/file")
export class OrderFileController {
  @Public()
  @Get()
  async getOrderFiles(@Res() res: Response) {
    const templateURL = 'https://storage.vardast.com/vardast/order/invoice-template.html';

    try {
      const response = await axios.get(templateURL);
      const template = response.data;

      // Sample data object
      const data = {
        date: '1403/02/02',
        invoiceNumber: '1403003',
        sellerAddress: 'بلوار کاوه، نرسیده به خیابان دولت، نبش کوچه اخلاقی غربی، پلاك 12,1 طبقه 2 واحد 4',
        sellerNationalId: '14011385876',
        buyerName: 'پاش کار',
        buyerNationalId: '10101398090',
        buyerAddress: 'چیتگر، کوچه مهر، بن بست پاش کار، پلاك 11، طبقه همکف',
        items: [
          { description: 'تیرآهن 140IPE', unitPrice: '59,600,000', quantity: '6', totalPrice: '357,600,000' },
          { description: 'تیرآهن 160IPE', unitPrice: '59,600,000', quantity: '7', totalPrice: '417,200,000' },
          { description: 'تیرآهن 240IPE', unitPrice: '109,000,000', quantity: '29', totalPrice: '3,161,000,000' },
          { description: 'تیرآهن 180IPE', unitPrice: '69,000,000', quantity: '10', totalPrice: '690,000,000' },
          { description: 'تیرآهن 270IPE', unitPrice: '127,000,000', quantity: '31', totalPrice: '3,937,000,000' },
          { description: 'حمل', unitPrice: '192,600,000', quantity: '1', totalPrice: '192,600,000' }
        ],
        totalAmount: '8,685,400,000',
        additions: '347,200,000',
        discount: '49,600,000',
        grandTotal: '9,003,000,000',
        instructions: 'خواهشمند است مبلغ فاکتور را به شماره شباي 530780100610810707075859 IR به نام شرکت خلق ارزش مهستان واریز فرمایید.'
      };

      // Inject dynamic data into the template
      const invoiceHTML = this.injectDataIntoTemplate(template, data);

      // Generate PDF from the HTML
      const pdfBuffer = await this.generatePdfFromHtml(invoiceHTML);

      // Set the response headers and send the PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Failed to fetch invoice template:', error);
      throw new Error('Failed to fetch invoice template');
    }
  }

  private injectDataIntoTemplate(template: string, data: any): string {
    const { date, invoiceNumber, sellerAddress, sellerNationalId, buyerName, buyerNationalId, buyerAddress, items, totalAmount, additions, discount, grandTotal, instructions } = data;

    const itemsHTML = items.map(item => `
      <tr>
        <td>${item.description}</td>
        <td>${item.unitPrice}</td>
        <td>${item.quantity}</td>
        <td>${item.totalPrice}</td>
      </tr>`).join('');

    return template.replace('{{date}}', date)
                   .replace('{{invoiceNumber}}', invoiceNumber)
                   .replace('{{sellerAddress}}', sellerAddress)
                   .replace('{{sellerNationalId}}', sellerNationalId)
                   .replace('{{buyerName}}', buyerName)
                   .replace('{{buyerNationalId}}', buyerNationalId)
                   .replace('{{buyerAddress}}', buyerAddress)
                   .replace('{{itemsHTML}}', itemsHTML)
                   .replace('{{totalAmount}}', totalAmount)
                   .replace('{{additions}}', additions)
                   .replace('{{discount}}', discount)
                   .replace('{{grandTotal}}', grandTotal)
                   .replace('{{instructions}}', instructions);
  }

  private async generatePdfFromHtml(html: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      pdf.create(html, { format: 'A4' }).toBuffer((err, buffer) => {
        if (err) {
          return reject(err);
        }
        resolve(buffer);
      });
    });
  }
}
