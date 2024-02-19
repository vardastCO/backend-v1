import { BaseEntity } from "typeorm";

export abstract class InfraEntity extends BaseEntity {
  protected abstract searchableFields: string[];

  protected getSearchFieldsString(): string {
    return this.searchableFields
      .map(field => `COALESCE("${field}", '')`)
      .join(" || ' ' || ");
  }

  public getSearchConstraint(): string {
    return `to_tsvector(${this.getSearchFieldsString()}) @@ websearch_to_tsquery(:query)`;
  }

  public getSearchOrder(): string {
    return `ts_rank_cd(to_tsvector(${this.getSearchFieldsString()}), websearch_to_tsquery(:query))`;
  }
}
