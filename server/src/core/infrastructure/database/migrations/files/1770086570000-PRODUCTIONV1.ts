import { MigrationInterface, QueryRunner } from 'typeorm';

export class PRODUCTIONV11770086570000 implements MigrationInterface {
  name = 'PRODUCTIONV11770086570000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "holidays" (
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "date" date NOT NULL,
                "type" character varying(50) NOT NULL,
                "description" character varying(500),
                "is_recurring" boolean NOT NULL DEFAULT false,
                "deleted_by" character varying(255),
                "deleted_at" TIMESTAMP,
                "created_by" character varying(255),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying(255),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_3646bdd4c3817d954d830881dfe" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "holidays"."name" IS 'Name of the holiday';
            COMMENT ON COLUMN "holidays"."date" IS 'Date of the holiday';
            COMMENT ON COLUMN "holidays"."type" IS 'Type of holiday (e.g., National, Regional, Special)';
            COMMENT ON COLUMN "holidays"."description" IS 'Description of the holiday';
            COMMENT ON COLUMN "holidays"."is_recurring" IS 'Whether the holiday recurs annually';
            COMMENT ON COLUMN "holidays"."deleted_by" IS 'User who deleted the holiday';
            COMMENT ON COLUMN "holidays"."created_by" IS 'User who created the holiday';
            COMMENT ON COLUMN "holidays"."updated_by" IS 'User who last updated the holiday'
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_edf0ee22a056c330fa5f121782" ON "holidays" ("name")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_40dfddee0c0d7125c767d8962b" ON "holidays" ("date")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_807f6c22fbc1ba875b1346328f" ON "holidays" ("type")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_1b42a425aea8d35df4fc9ebfdb" ON "holidays" ("deleted_at")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_1b42a425aea8d35df4fc9ebfdb"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_807f6c22fbc1ba875b1346328f"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_40dfddee0c0d7125c767d8962b"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_edf0ee22a056c330fa5f121782"
        `);
    await queryRunner.query(`
            DROP TABLE "holidays"
        `);
  }
}
