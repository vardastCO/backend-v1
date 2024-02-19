import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChildCategoryIdsFunction1690115533003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION public.child_category_ids(parent_category_id integer)
    RETURNS TABLE(category_id integer)
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
            id = parent_category_id
            UNION
            SELECT
            cc.id,
            cc."parentCategoryId"
            FROM
            category_hierarchy ch
            JOIN base_taxonomy_categories cc ON ch.id = cc."parentCategoryId"
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
