// import { Body, Res, Controller, Post, UseInterceptors } from "@nestjs/common";
// import { FileInterceptor } from "@nestjs/platform-express";
// import { Product } from "./entities/product.entity";
// import {
//   createObjectCsvWriter,
//   createArrayCsvWriter,
//   CsvWriter,
//   ArrayCsvWriterParams,
//   ObjectCsvWriterParams,
// } from 'csv-writer';

// @Controller("export/seller/report")
// export class ProductExportSeller {
//   constructor() {}

//   @Post()
//   @UseInterceptors(FileInterceptor("file"))
//   async export(
//     @Body() body: { sellerId: number },
//     @Res() res: any
//   ) {
//     const queryBuilder = Product.createQueryBuilder();
//     const { sellerId } = body;

//     if (sellerId) {
//       queryBuilder
//         .innerJoin(`${queryBuilder.alias}.offers`, 'offer')
//         .where('offer.sellerId = :sellerId', { sellerId });
//     }

//     const products = await queryBuilder.getMany();

//     const csvWriter = createObjectCsvWriter({
//       path: 'products.csv',
//       header: [/* Specify your header columns here */],
//     } as ObjectCsvWriterParams);

//     await csvWriter.writeRecords(products);

//     res.setHeader('Content-Type', 'text/csv');
//     res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    
//     // Assuming writeRecords writes directly to the response
//     res.send();
//   }
// }
