// cron-job.service.ts
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import axios from "axios";
import { KavenegarService } from "./base/kavenegar/kavenegar.service";

@Injectable()
export class CronJobService {
  constructor(private readonly kavenegarService: KavenegarService, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}
 
  // @Cron(CronExpression.EVERY_5_SECONDS)
  // async logProductViewsToElasticsearch() {
  //   // Fetch product views and log to Elasticsearch
  //   await this.fetchAndLogProductViewsToElasticsearch();
  // }
  // @Cron(CronExpression.EVERY_5_SECONDS)
  // async logRequestToElasticsearch() {
  //   // Fetch product views and log to Elasticsearch
  //   await this.fetchRequestViewsToElasticsearch();
  // }
  // @Cron(CronExpression.EVERY_5_SECONDS)
  // async logSellerViewsToElasticsearch() {
  //   // Fetch product views and log to Elasticsearch
  //   await this.fetchAndLogSellerViewsToElasticsearch();
  // }

  // @Cron(CronExpression.EVERY_5_SECONDS)
  // async logTrackerViewsToElasticsearch() {
  //   const allKeys: string[] = await this.cacheManager.store.keys();
  //   const productKeys: string[] = allKeys.filter(key =>
  //     key.startsWith("eventTracker:"),
  //   );

  //   const views: any[] = await Promise.all(
  //     productKeys.map(async key => {
  //       const value = await this.cacheManager.get(key);

  //       return { key, value };
  //     }),
  //   );
  //   await this.logTrackerToElasticsearch(views)
  // }
  // @Cron(CronExpression.EVERY_5_SECONDS)
  // async logBrandViewsToElasticsearch() {
  //   // Fetch product views and log to Elasticsearch
  //   await this.fetchAndLogBrandViewsToElasticsearch();
  // }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async sendOTPWithKavenegar() {
    const allKeys: string[] = await this.cacheManager.store.keys();
    const productKeys: string[] = allKeys.filter(key =>
      key.startsWith("kavenegar"),
    );
    productKeys.map(async (key) => {
      try {
        
        const [prefix, cellphone, token] = key.split(':');
        await this.cacheManager.del(key);
        await this.kavenegarService.lookup(cellphone, "verify", token);
          
      } catch (e) {
        console.log('errr kavenegar', e);
      }
    })

     
  }
  private async fetchAndLogBrandViewsToElasticsearch(): Promise<void> {
    const allKeys: string[] = await this.cacheManager.store.keys();
    const productKeys: string[] = allKeys.filter(key =>
      key.startsWith("brand_views_"),
    );

    const views: any[] = await Promise.all(
      productKeys.map(async key => {
        const value = await this.cacheManager.get(key);

        return { key, value };
      }),
    );

    await this.logBrandToElasticsearch(views);
  }
  private async fetchAndLogSellerViewsToElasticsearch(): Promise<void> {
    const allKeys: string[] = await this.cacheManager.store.keys();
    const productKeys: string[] = allKeys.filter(key =>
      key.startsWith("seller_views_"),
    );

    const views: any[] = await Promise.all(
      productKeys.map(async key => {
        const value = await this.cacheManager.get(key);

        return { key, value };
      }),
    );

    await this.logSellerToElasticsearch(views);
  }
  private async fetchAndLogProductViewsToElasticsearch(): Promise<void> {
    const allKeys: string[] = await this.cacheManager.store.keys();
    const productKeys: string[] = allKeys.filter(key =>
      key.startsWith("product_views_"),
    );

    const views: any[] = await Promise.all(
      productKeys.map(async key => {
        const value = await this.cacheManager.get(key);

        return { key, value };
      }),
    );

    await this.logViewsToElasticsearch(views);
  }

  private async fetchRequestViewsToElasticsearch(): Promise<void> {
    const allKeys: string[] = await this.cacheManager.store.keys();
    const productKeys: string[] = allKeys.filter(key =>
      key.startsWith("request_"),
    );

    const views: any[] = await Promise.all(
      productKeys.map(async key => {
        const value = await this.cacheManager.get(key);

        return { key, value };
      }),
    );

    await this.logViewsToElasticsearch(views);
  }

  private async logViewsToElasticsearch(views: any[]): Promise<void> {
    const elasticsearchUrl = "http://elasticsearch:9200";
    const indexName = "product_views";
    if (views.length == 0) {
      return;
    }
    for (const view of views) {
      try {
        this.cacheManager.del(view.key);
        await axios
          .post(`${elasticsearchUrl}/${indexName}/_doc`, view)
          .then(e => {})
          .catch(e => {});
      } catch (error) {
        // Handle error appropriately
        console.error("Error logging view to Elasticsearch:", error.message);
      }
    }
  }
  private async logSellerToElasticsearch(views: any[]): Promise<void> {
    const elasticsearchUrl = "http://elasticsearch:9200";
    const indexName = "seller_views";
    if (views.length == 0) {
      return;
    }
    for (const view of views) {
      try {
        this.cacheManager.del(view.key);
        await axios
          .post(`${elasticsearchUrl}/${indexName}/_doc`, view)
          .then(e => {})
          .catch(e => {});
      } catch (error) {
        // Handle error appropriately
        console.error("Error logging view to Elasticsearch:", error.message);
      }
    }
  }
  private async logBrandToElasticsearch(views: any[]): Promise<void> {
    const elasticsearchUrl = "http://elasticsearch:9200";
    const indexName = "brand_views";
    if (views.length == 0) {
      return;
    }
    for (const view of views) {
      try {
        this.cacheManager.del(view.key);
        await axios
          .post(`${elasticsearchUrl}/${indexName}/_doc`, view)
          .then(e => {})
          .catch(e => {});
      } catch (error) {
        // Handle error appropriately
        console.error("Error logging view to Elasticsearch:", error.message);
      }
    }
  }

  private async logTrackerToElasticsearch(views: any[]): Promise<void> {
    const elasticsearchUrl = "http://elasticsearch:9200";
    const indexName = "track_contact";
    if (views.length == 0) {
      return;
    }
    for (const view of views) {
      try {
        this.cacheManager.del(view.key);
        await axios
          .post(`${elasticsearchUrl}/${indexName}/_doc`, view)
          .then(e => {})
          .catch(e => {});
      } catch (error) {
        // Handle error appropriately
        console.error("Error logging view to Elasticsearch:", error.message);
      }
    }
  }
}
