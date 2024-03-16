import { ConfigService } from "@nestjs/config";
import * as Fs from "fs";
import * as Mime from "mime-types";
import { Client } from "minio";
import { Command, CommandRunner } from "nest-commander";
import { CsvParser } from "nest-csv-parser";
import { InjectMinio } from "nestjs-minio";
import { exit } from "process";
import { Directory } from "src/base/storage/directory/entities/directory.entity";
import { File } from "src/base/storage/file/entities/file.entity";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { Vocabulary } from "src/base/taxonomy/vocabulary/entities/vocabulary.entity";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { AttributeValue } from "../attribute-value/entities/attribute-value.entity";
import { AttributeValues } from "../attribute/entities/attribute-values.type";
import { Attribute } from "../attribute/entities/attribute.entity";
import { AttributeTypesEnum } from "../attribute/enums/attribute-types.enum";
import { Brand } from "../brand/entities/brand.entity";
import { Image } from "../images/entities/image.entity";
import { Offer } from "../offer/entities/offer.entity";
import { Price } from "../price/entities/price.entity";
import { PriceTypesEnum } from "../price/enums/price-types.enum";
import { Seller } from "../seller/entities/seller.entity";
import { Uom } from "../uom/entities/uom.entity";
import { Product } from "./entities/product.entity";
import { ProductTypesEnum } from "./enums/product-types.enum";
import * as Path from "path";
@Command({
  name: "product:seed",
  description: "Seed products from given csv file base on official format.",
})
export class ProductCsvSeedCommand extends CommandRunner {
  private attributeRegex =
    /^([^\:]+)\:\s+([^\|\:]+)(?: +\| ([ضصثقفغعهخحجچپشسیبلاتنمکگظطزرژذدئوa-zA-Z0-9\.\s\/]+))?(?:- +([a-z0-9]+))?$/;

  // prettier-ignore
  private headerMap = {
    "ردیف": "no",
    "name": "name",
    "SKU": "sku",
    "برند": "brand",
    "دسته‌بندی": "category",
    "واحد اندازه‌گیری": "uom",
    "قیمت (تومان)": "price",
    "توضیحات": "description",
    "خصوصیات / ویژگی‌ها": "csvAttributes",
  };

  private valueMap = {
    csvAttributes: value => {
      const attributes = value.split(/\n|(\r\n)/) ?? [];
      return attributes
        .map(attribute => {
          attribute = attribute ?? "";
          if (!attribute.match(this.attributeRegex)) {
            // console.warn(
            //     `Attribute '${attribute}' is not matching the regex provided, skipping.`
            // );
            return null;
          }
          const [, name, value, uom, sku] = attribute.match(
            this.attributeRegex,
          );
          return {
            name,
            value: value.trim(),
            uom,
            sku,
          };
        })
        .filter(a => a)
        .reduce((carry, cleanAttribute) => {
          const currentAttributeValue = {
            value: cleanAttribute.value,
            sku: cleanAttribute.sku,
          };

          // Check if the attribute name already exists in carry
          if (carry.hasOwnProperty(cleanAttribute.name)) {
            const existingAttribute = carry[cleanAttribute.name];

            // Check if the value doesn't already exist in attributeValues or options
            const isDuplicate = existingAttribute.attributeValues.some(
              attrValue =>
                attrValue.value.trim()[0] === cleanAttribute.value.trim()[0] && // Compare first character
                attrValue.value.trim().slice(-1) ===
                  cleanAttribute.value.trim().slice(-1), // Compare last character
            );

            if (!isDuplicate) {
              existingAttribute.attributeValues.push(currentAttributeValue);
              existingAttribute.values.options.push(cleanAttribute.value);
            } else {
              //   console.warn(`Duplicate attribute value: ${cleanAttribute.value}`);
            }

            if (carry.uom !== cleanAttribute.uom) {
              // console.warn(
              //     `Mismatched uom on attributes with the same name! ${cleanAttribute.name}`
              // );
            }
          } else {
            carry[cleanAttribute.name] = {
              name: cleanAttribute.name,
              uom: cleanAttribute.uom,
              type: AttributeTypesEnum.TEXT,
              values: { options: [cleanAttribute.value] },
              attributeValues: [currentAttributeValue],
            };
          }
          return carry;
        }, {});
    },
  };

  private readonly logService = console;

  constructor(
    private readonly csvParser: CsvParser,
    @InjectMinio() private readonly minioClient: Client,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async run(passedParam: string[], options?: any): Promise<void> {
    await this.setBrands();
    await this.setSellers();
    await this.setCategoriesAndVocabulary();
    // await this.setUoms();
    await this.setAttributes();

    const [csvFile, imageDirectory] = passedParam;

    // Read all CSV files in the outputFolder
    // const csvFiles = Fs.readdirSync(outputFolder).filter(file =>
    //   file.toLowerCase().endsWith(".csv"),
    // );

    const stream = Fs.createReadStream(csvFile, "utf8");

    await this.setFiles(imageDirectory);

    const csvProducts = await this.csvParser.parse(
      stream,
      CsvProduct,
      null,
      null,
      {
        mapHeaders: ({ header, index }) => this.headerMap[header],
        mapValues: ({ header, index, value }) =>
          this.valueMap.hasOwnProperty(header)
            ? this.valueMap[header](value)
            : value,
        separator: ",",
      },
    );

    let j = 1;
    for (const csvProduct of csvProducts.list) {
      try {
        if (!csvProduct.name) {
          continue;
        }
        const existingProduct: Product = await Product.findOneBy({
          sku: csvProduct.sku,
        });
        if (existingProduct) {
          // this.logService.warn(
          //   `(${j++}/${csvProducts.total}) product {sku: ${
          //     existingProduct.sku
          //   }} already exists, skipping...`,
          // );
          continue;
        }

        const productSkus = [csvProduct.sku];
        const product: Product = Product.create({
          slug: csvProduct.sku,
          type: ProductTypesEnum.PHYSICAL,
          name: csvProduct.name,
          sku: csvProduct.sku,
          description: "",
          status: ThreeStateSupervisionStatuses.CONFIRMED,
          createdById: 1,
        });

        product.brand = Promise.resolve(
          await this.firstOrCreateBrand(csvProduct.brand),
        );
        const category = await this.firstOrCreateCategory(
          csvProduct.category,
        );
        // const percentage = await this.calculatePercentage(category.title, csvProduct.category );

        // if(percentage < .6)
        // {
        //   product.isActive = false ;

        //   this.logService.log('status pending');
        // }
        if (!category) {
          throw "no category";
          // throw (csvProduct.sku)
        }
        product.category = Promise.resolve(category);

        // product.uom = Promise.resolve(
        //   await this.firstOrCreateUom(csvProduct.uom),
        // );
        product.uomId = 1;
        await product.save();

        const processedAttributes = new Set();

        for (const key in csvProduct.csvAttributes) {
          const csvAttribute = csvProduct.csvAttributes[key];

          // Check if the attribute has not been processed yet
          if (!processedAttributes.has(csvAttribute)) {
            try {
              await this.firstOrCreateAttribute(
                csvAttribute,
                product,
                category,
                productSkus,
              );

              // Mark the attribute as processed
              processedAttributes.add(csvAttribute);
            } catch (error) {}
          }
        }

        if (csvProduct.price) {
          // seller
          const seller = await this.firstOrCreateSeller(csvProduct.brand);

          const amount =
            +(csvProduct.price + "").replace(/[^0-9.]/g, "") / 10;
          const price = Price.create({
            amount,
            type: PriceTypesEnum.CONSUMER,
            isPublic: true,
            createdById: 1,
            sellerId: seller.id,
          });
          price.product = Promise.resolve(product);
          await price.save();

          // offer
          const offer = Offer.create({
            productId: product.id,
            sellerId: seller.id,
            status: ThreeStateSupervisionStatuses.CONFIRMED,
            isPublic: true,
            isAvailable: true,
          });
          await offer.save();
        }

        const filenameRegex = new RegExp(
          `^(${productSkus.join("|")})-(\\d+).(jpg|jpeg|png|webp)$`,
        );
        let i = 1;
        for (const index of this.files) {
          try {
            const filename = index;
            const isRelatedToCurrentProduct = filenameRegex.test(filename);
            if (!isRelatedToCurrentProduct) {
              console.log("dddd", isRelatedToCurrentProduct, filename);
              continue;
            }
            const [, sku, sort, extention] = filename.match(filenameRegex);
            await this.addImage(
              imageDirectory,
              filename,
              product,
              sort ? +sort : i++,
            );
            this.files = this.files.filter(filename => filename !== index);
          } catch (w) {
            console.log("warning", w, "warning");
          }
        }

        // this.logService.log(`(${j++}/${csvProducts.total}) Seeded.`);
      } catch (e) {
        console.log(e);
      }
      this.files = this.files.filter(f => f);
    }
    // }
    this.logService.log("finished.", {
      remainingFiles: this.files,
      remainingFilesCount: this.files.length,
    });
    exit(0);
  }

  /**
   * Brand
   */
  private brandNameToObjectMap: any /*: {[Property in keyof string]: Brand}*/;

  async setBrands() {
    this.brandNameToObjectMap = (await Brand.find()).reduce((carry, value) => {
      carry[value.name] = value;
      return carry;
    }, {});
  }

  async firstOrCreateBrand(name: string): Promise<Brand> {
    const brand =
      this.brandNameToObjectMap[name] ??
      Brand.create({
        name: name,
        slug: name,
      });
    if (!this.brandNameToObjectMap.hasOwnProperty(name)) {
      await brand.save();
    }
    this.brandNameToObjectMap[name] = brand;
    return brand;
  }

  /**
   * Seller
   */
  private sellerNameToObjectMap /*: {[Property in keyof string]: Seller}*/;

  async setSellers() {
    this.sellerNameToObjectMap = (await Seller.find()).reduce(
      (carry, value) => {
        carry[value.name] = value;
        return carry;
      },
      {},
    );
  }

  async firstOrCreateSeller(name: string): Promise<Seller> {
    const seller =
      this.sellerNameToObjectMap[name] ??
      Seller.create({
        name: name,
        createdById: 1,
      });
    if (!this.sellerNameToObjectMap.hasOwnProperty(name)) {
      await seller.save();
    }
    this.sellerNameToObjectMap[name] = seller;
    return seller;
  }

  /**
   * Category
   */
  private productsVocabulary: Vocabulary;

  private categoryNameToObjectMap;

  async setCategoriesAndVocabulary() {
    this.productsVocabulary = await Vocabulary.findOneByOrFail({
      slug: "product_categories",
    });

    this.categoryNameToObjectMap = (
      await this.productsVocabulary.categories
    ).reduce((carry, value) => {
      carry[value.title] = value;
      return carry;
    }, {});
  }

  async firstOrCreateCategory(title: string): Promise<Category> {
    // const result = await this.findMostSimilarCategory(title, this.categoryNameToObjectMap);
    // const category: Category =
    //   this.categoryNameToObjectMap[result] ?? false
    // // if (!this.categoryNameToObjectMap.hasOwnProperty(title)) {
    // //   category.vocabulary = Promise.resolve(this.productsVocabulary);
    // //   await category.save();
    // //   this.categoryNameToObjectMap[title] = category;
    // // }
    // return category;

    const existingCategories: Category[] = await Category.findBy({
      title: title,
    });

    if (existingCategories.length > 0) {
      // If a category with the title exists, return the first one
      return existingCategories[0];
    } else {
      // If the category doesn't exist, create a new one
      const newCategory = Category.create({
        title: title,
        slug: title,
        vocabularyId: 1, // Set the appropriate vocabulary ID
        parentCategoryId: 3876, // Set the appropriate parent category ID
      });

      // Save the newly created category to the database
      await newCategory.save();

      return newCategory;
    }

    // const categories: Category[] = await Category.findBy({
    //   title: title,
    // });

    // const category: Category =
    //   categories.length > 0
    //     ? categories[0] // Take the first category if there are multiple matches
    //     : Category.create({
    //         title: title,
    //         slug: title,
    //         vocabularyId:1,
    //         parentCategoryId: 1404,
    //       });
    // this.categoryNameToObjectMap[title] ??
    // Category.create({
    //   title: title,
    //   slug: title,
    //   parentCategoryId:1404
    //   // });
    // if (!this.categoryNameToObjectMap.hasOwnProperty(title)) {
    //   category.vocabulary = Promise.resolve(this.productsVocabulary);
    //   await category.save();
    //   this.categoryNameToObjectMap[title] = category;
    // }
    // return category;
  }

  async calculatePercentage(word1: string, word2: string): Promise<number> {
    const commonCharacters = [...new Set([...word1])].filter(char =>
      word2.includes(char),
    );
    const percentage = commonCharacters.length / word1.length;
    return percentage;
  }

  async calculateLevenshteinDistance(s1: string, s2: string) {
    const m = s1.length;
    const n = s2.length;
    const dp: number[][] = Array.from(Array(m + 1), () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) {
      for (let j = 0; j <= n; j++) {
        if (i === 0) {
          dp[i][j] = j;
        } else if (j === 0) {
          dp[i][j] = i;
        } else if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    return dp[m][n];
  }

  async findMostSimilarCategory(
    inputString: string,
    categoryArray: { [key: string]: { title: string } },
  ): Promise<string | null> {
    // Remove spaces and convert input to lowercase for better matching
    const cleanedInput = inputString.replace(/\s/g, "").toLowerCase();

    // Variables to store the most similar category and its similarity score
    let mostSimilarCategory: string | null = null;
    let lowestLevenshteinDistance: number = Infinity;

    for (const categoryName in categoryArray) {
      const categoryTitle = categoryArray[categoryName].title;

      // Calculate the Levenshtein distance between cleanedInput and the category title
      const distance = await this.calculateLevenshteinDistance(
        cleanedInput,
        categoryTitle,
      );

      // Check if the Levenshtein distance is lower than the current lowest distance
      if (distance < lowestLevenshteinDistance) {
        lowestLevenshteinDistance = distance;
        mostSimilarCategory = categoryName;
      }
    }

    return Promise.resolve(mostSimilarCategory);
  }

  /**
   * Uom
   */
  private uoms: Uom[];

  async setUoms() {
    this.uoms = await Uom.find();
  }

  async firstOrCreateUom(name: string): Promise<Uom> {
    let uom: Uom = this.uoms.find(
      uom => uom.name === name || uom.symbol === name,
    );
    if (!uom) {
      // uom = Uom.create({
      //   name: name,
      //   slug: name,
      //   symbol: name,
      //   isActive: true,
      // });
      // await uom.save();
      // this.uoms.push(uom);
    }
    return uom;
  }

  /**
   * Attributes
   */
  private attributes: Attribute[];

  async setAttributes() {
    this.attributes = await Attribute.find();
  }

  async firstOrCreateAttribute(
    csvAttribute: CsvAttribute,
    product: Product,
    category: Category,
    skus: string[],
  ) {
    const attributeSlug = `${csvAttribute.name}:${category.id}`;
    const attributeUom = csvAttribute.uom
      ? await this.firstOrCreateUom(csvAttribute.uom)
      : null;

    let attribute: Attribute = this.attributes.find(attribute => {
      return (
        attribute.slug == attributeSlug &&
        attribute.name == csvAttribute.name &&
        (attributeUom === null || attribute.uomId == attributeUom.id)
      );
    });
    if (!attribute) {
      // TODO: add category to attribute
      attribute = Attribute.create({
        name: csvAttribute.name,
        type: csvAttribute.type,
        values: csvAttribute.values,
        slug: attributeSlug,
        uomId: attributeUom ? attributeUom.id : null,
      });
      attribute.categories = Promise.resolve([category]);
      await attribute.save();

      this.attributes.push(attribute);
    } else {
      const existingCategories = await attribute.categories;
      existingCategories.push(category);

      if (
        attribute.values &&
        Array.isArray(attribute.values.options) &&
        Array.isArray(csvAttribute.values.options)
      ) {
        for (const option of csvAttribute.values.options) {
          if (!attribute.values.options.includes(option)) {
            attribute.values.options.push(option);
          }
        }
      }

      await attribute.save();
    }

    for (const attributeValueCsv of csvAttribute.attributeValues) {
      attributeValueCsv.sku ? skus.push(attributeValueCsv.sku) : null;
      const attributeValue = AttributeValue.create({
        ...attributeValueCsv,
      });
      attributeValue.product = Promise.resolve(product);
      attributeValue.attribute = Promise.resolve(attribute);
      await attributeValue.save();
    }

    return attribute;
  }

  /**
   * Files
   */
  private files: string[];
  private directory: Directory;
  private bucketName: string;

  async setFiles(imageDirectory: string) {
    this.files = imageDirectory ? Fs.readdirSync(imageDirectory) : [];
    this.directory = await Directory.findOneBy({ path: "product/image/files" });
    this.bucketName = this.configService.get("STORAGE_MINIO_DEFAULT_BUCKET");
  }

  // async arabicToPersian(input: string): Promise<string> {
  //   // Define character replacement mapping
  //   const charMap = {
  //     'أ': 'ا',
  //     'ب': 'پ',
  //     'ت': 'ت',
  //     'ث': 'ث',
  //     'ج': 'ج',
  //     'ح': 'ح',
  //     'خ': 'خ',
  //     'د': 'د',
  //     'ذ': 'ذ',
  //     'ر': 'ر',
  //     'ز': 'ز',
  //     'س': 'س',
  //     'ش': 'ش',
  //     'ص': 'ص',
  //     'ض': 'ض',
  //     'ط': 'ط',
  //     'ظ': 'ظ',
  //     'ع': 'ع',
  //     'غ': 'غ',
  //     'ف': 'ف',
  //     'ق': 'ق',
  //     'ك': 'ک', // Replace Arabic 'ك' with Persian 'ک'
  //     'ل': 'ل',
  //     'م': 'م',
  //     'ن': 'ن',
  //     'ه': 'ه',
  //     'و': 'و',
  //     'ي': 'ی', // Replace Arabic 'ي' with Persian 'ی'
  //   };

  //   let result = '';

  //   for (let i = 0; i < input.length; i++) {
  //     const char = input[i];
  //     result += charMap[char] || char;
  //   }

  //   return result;
  // }

  async addImage(
    imageDirectory: string,
    filename: string,
    product: Product,
    sort: number,
  ) {
    try {
      const filepath = `${imageDirectory}/${filename}`;
      const file = {
        buffer: Fs.readFileSync(filepath),
        mimetype: Mime.lookup(filepath),
        size: Fs.statSync(filepath).size,
      };

      const randomizedFilename = File.generateNewFileName(file);

      let fileRecord: File | null = await File.findOneBy({
        name: `${this.directory.path}/${randomizedFilename}`,
      });

      if (!fileRecord) {
        fileRecord = File.create<File>({
          modelType: Image.name,
          name: `${this.directory.path}/${randomizedFilename}`,
          originalName: filename,
          size: file.size,
          mimeType: file.mimetype,
          disk: "minio",
          bucketName: this.bucketName,
        });
        fileRecord.directory = Promise.resolve(this.directory);
        await fileRecord.save();
      }
      fileRecord.directory = Promise.resolve(this.directory);
      await fileRecord.save();

      const image = Image.create({
        productId: product.id,
        fileId: fileRecord.id,
        sort: sort,
      });
      await image.save();

      await this.minioClient.putObject(
        this.bucketName,
        fileRecord.name,
        file.buffer,
        {
          "Content-Type": file.mimetype,
          "File-Uuid": fileRecord.uuid,
          "File-Id": fileRecord.id,
        },
      );
    } catch (e) {
      console.log("faaaaaaa", e);
    }
  }
}

class CsvProduct {
  no: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  price: string;
  csvAttributes: {
    [keyof: string]: CsvAttribute;
  };
}
class CsvAttribute {
  name: string;
  uom: string;
  type: AttributeTypesEnum;
  values: AttributeValues;
  attributeValues: { value: string; sku: string }[];
}
