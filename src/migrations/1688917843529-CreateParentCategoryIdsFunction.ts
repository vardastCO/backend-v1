import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateParentCategoryIdsFunction1688917843529
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION public.parent_category_ids(child_category_id int)
      RETURNS TABLE(category_id int)
      LANGUAGE plpgsql
      STABLE STRICT
      AS $function$
      begin
      RETURN QUERY WITH RECURSIVE category_hierarchy AS (
        SELECT
          id,
          "parentCategoryId"
        FROM
          base_taxonomy_categories
        WHERE
          id = child_category_id
        UNION
        SELECT
          pc.id,
          pc."parentCategoryId"
        FROM
          category_hierarchy ch
          JOIN base_taxonomy_categories pc ON ch."parentCategoryId" = pc.id
      )
      SELECT
        id
      FROM
        category_hierarchy;
      end;
      $function$;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP FUNCTION public.parent_category_ids;`);
  }
}
