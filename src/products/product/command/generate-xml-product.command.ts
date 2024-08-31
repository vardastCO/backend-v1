import { Client } from "minio";
import { Command, CommandRunner } from "nest-commander";
import { InjectMinio } from "nestjs-minio";
import { Between } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import * as xml2js from "xml2js";
import * as zlib from "zlib";
import { Product } from "../entities/product.entity";

@Command({
  name: "product:xml",
  description: "product xml from given csv file based on the official format.",
})
export class XmlProductCommand extends CommandRunner {
  constructor(@InjectMinio() private readonly minioClient: Client) {
    super();
  }

  async run(): Promise<void> {
    console.log("hi");

    const productsPerPage = 1000; // Adjust based on your needs

    const xmlBuilder = new xml2js.Builder({
      xmldec: { version: "1.0", encoding: "UTF-8" },
      renderOpts: { pretty: true, indent: "  ", newline: "\n" },
    });

    // Creating a response object (mocking it for the command)
    const res = {
      set: () => ({}), // Mocking set method
      status: () => ({ write: () => ({}), end: () => ({}) }), // Mocking status method
    } as any;

    res.set("Content-Type", "application/gzip");
    res.set("Content-Disposition", "attachment; filename=sitemaps.zip");
    res.status(200).write("\x1F\x8B\x08\x00\x00\x00\x00\x00"); // Gzip file signature

    const totalProductCount = await Product.count();
    // console.log("total:", totalProductCount);

    for (let i = 0; i < totalProductCount; i += productsPerPage) {
      const start = i + 345400;
      const end = Math.min(i + 345400 + productsPerPage - 1);

      const { idsAndNames, count } = await this.findProductIdsAndCount(
        start,
        end,
      );
      const urls = this.generateUrls(idsAndNames);
      const xmlObject = this.generateXmlObject(urls);
      const xmlString = xmlBuilder.buildObject(xmlObject);

      const buffer = Buffer.from(xmlString, "utf-8");
      const compressedBuffer = zlib.gzipSync(buffer);
      const randomZipNumber = Math.floor(Math.random() * 100) + 1;

      // Construct the ZIP file name with the random number
      const uuid = uuidv4().replace(/-/g, "");
      const zipFileName = `${uuid}.gz`;

      // const filepath = `/usr/src/app/${zipFileName}`;
      const file = {
        buffer: compressedBuffer,
        mimetype: "application/gzip",
        size: compressedBuffer.length,
      };

      await this.minioClient.putObject("vardast", zipFileName, file.buffer, {
        "Content-Type": file.mimetype,
      });

      //  zipFileStream.write(compressedBuffer);
    }
    res.status(200).end();
  }

  async findProductIdsAndCount(
    start: number,
    end: number,
  ): Promise<{ idsAndNames: { id: number; name: string }[]; count: number }> {
    // console.log('start',start,'end',end)
    const [products, count] = await Product.findAndCount({
      where: { id: Between(start, end) },
    });

    const idsAndNames = products.map(product => ({
      id: product.id,
      name: product.name,
    }));
    // console.log('count',count)

    return { idsAndNames, count };
  }

  private generateUrls(idsAndNames: { id: number; name: string }[]): string[] {
    return idsAndNames.map(
      idName => `https://www.vardast.com/product/${idName.id}/${idName.name}`,
    );
  }

  private generateXmlObject(urls: string[]): Record<string, any> {
    // const  urlset = {
    //     $: { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' },
    //     url: urls.map(url => ({
    //       loc: url,
    //       changefreq: 'monthly',
    //       priority: '0.8'
    //     }))
    //   }
    // console.log(urlset);
    // console.log(urlset.url.map(url => url.loc).join('\n'));

    return {
      urlset: {
        $: { xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9" },
        url: urls.map(url => ({
          loc: url,
          changefreq: "monthly",
          priority: "0.8",
        })),
      },
    };
  }
}
