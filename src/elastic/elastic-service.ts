import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";

@Injectable()
export class ElasticsearchServices {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async createIndex(index: string): Promise<any> {
    return await this.elasticsearchService.indices.create({ index });
  }

  async indexDocument(index: string, body: any): Promise<any> {
    return await this.elasticsearchService.index({ index, body });
  }

  async search(index: string, query: any): Promise<any> {
    return await this.elasticsearchService.search({ index, body: query });
  }
}
