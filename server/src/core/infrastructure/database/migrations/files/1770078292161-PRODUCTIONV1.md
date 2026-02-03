import { MigrationInterface, QueryRunner } from "typeorm";

export class PRODUCTIONV11770078292161 implements MigrationInterface {
    name = 'PRODUCTIONV11770078292161'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "activitylog" (
                "id" SERIAL NOT NULL,
                "action" character varying(100) NOT NULL,
                "entity" character varying(100) NOT NULL,
                "details" json,
                "employee_id" integer,
                "occurred_at" TIMESTAMP NOT NULL DEFAULT now(),
                "request_info" json,
                CONSTRAINT "PK_45ea5194b66252c991f4f0794be" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f0215d2793f50225f63db488fd" ON "activitylog" ("occurred_at")
        `);
        await queryRunner.query(`
            CREATE TABLE "user_permissions" (
                "id" SERIAL NOT NULL,
                "user_id" integer NOT NULL,
                "permission_id" integer NOT NULL,
                "is_allowed" boolean NOT NULL,
                "created_by" character varying(255),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_01f4295968ba33d73926684264f" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "user_permissions"."user_id" IS 'ID of the user';
            COMMENT ON COLUMN "user_permissions"."permission_id" IS 'ID of the permission';
            COMMENT ON COLUMN "user_permissions"."is_allowed" IS 'Whether the permission is allowed (true) or denied (false)';
            COMMENT ON COLUMN "user_permissions"."created_by" IS 'User who created the user-permission link'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3495bd31f1862d02931e8e8d2e" ON "user_permissions" ("user_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8145f5fadacd311693c15e41f1" ON "user_permissions" ("permission_id")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_a537c48b1f80e8626a71cb5658" ON "user_permissions" ("user_id", "permission_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "permissions" (
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "resource" character varying(100) NOT NULL,
                "action" character varying(50) NOT NULL,
                "description" character varying(500),
                "deleted_by" character varying(255),
                "deleted_at" TIMESTAMP,
                "created_by" character varying(255),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying(255),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("name"),
                CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "permissions"."name" IS 'Unique name of the permission';
            COMMENT ON COLUMN "permissions"."resource" IS 'Resource that the permission applies to';
            COMMENT ON COLUMN "permissions"."action" IS 'Action that the permission allows';
            COMMENT ON COLUMN "permissions"."description" IS 'Description of the permission';
            COMMENT ON COLUMN "permissions"."deleted_by" IS 'User who deleted the permission';
            COMMENT ON COLUMN "permissions"."created_by" IS 'User who created the permission';
            COMMENT ON COLUMN "permissions"."updated_by" IS 'User who last updated the permission'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_48ce552495d14eae9b187bb671" ON "permissions" ("name")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_89456a09b598ce8915c702c528" ON "permissions" ("resource")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1c1e0637ecf1f6401beb9a68ab" ON "permissions" ("action")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1ea42cae477fc1dc619a5cd280" ON "permissions" ("deleted_at")
        `);
        await queryRunner.query(`
            CREATE TABLE "role_permissions" (
                "id" SERIAL NOT NULL,
                "role_id" integer NOT NULL,
                "permission_id" integer NOT NULL,
                "created_by" character varying(255),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_84059017c90bfcb701b8fa42297" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "role_permissions"."role_id" IS 'ID of the role';
            COMMENT ON COLUMN "role_permissions"."permission_id" IS 'ID of the permission';
            COMMENT ON COLUMN "role_permissions"."created_by" IS 'User who created the role-permission link'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_178199805b901ccd220ab7740e" ON "role_permissions" ("role_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_25d24010f53bb80b78e412c965" ON "role_permissions" ("role_id", "permission_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "description" character varying(500),
                "deleted_by" character varying(255),
                "deleted_at" TIMESTAMP,
                "created_by" character varying(255),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying(255),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"),
                CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "roles"."name" IS 'Unique name of the role';
            COMMENT ON COLUMN "roles"."description" IS 'Description of the role';
            COMMENT ON COLUMN "roles"."deleted_by" IS 'User who deleted the role';
            COMMENT ON COLUMN "roles"."created_by" IS 'User who created the role';
            COMMENT ON COLUMN "roles"."updated_by" IS 'User who last updated the role'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_648e3f5447f725579d7d4ffdfb" ON "roles" ("name")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7fd0c79dc4e6083ddea850ac38" ON "roles" ("deleted_at")
        `);
        await queryRunner.query(`
            CREATE TABLE "user_roles" (
                "id" SERIAL NOT NULL,
                "user_id" integer NOT NULL,
                "role_id" integer NOT NULL,
                "created_by" character varying(255),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "user_roles"."user_id" IS 'ID of the user';
            COMMENT ON COLUMN "user_roles"."role_id" IS 'ID of the role';
            COMMENT ON COLUMN "user_roles"."created_by" IS 'User who created the user-role link'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles" ("user_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON "user_roles" ("role_id")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_23ed6f04fe43066df08379fd03" ON "user_roles" ("user_id", "role_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "username" character varying(100) NOT NULL,
                "email" character varying(255) NOT NULL,
                "password" character varying(255),
                "first_name" character varying(100),
                "middle_name" character varying(100),
                "last_name" character varying(100),
                "phone" character varying(20),
                "date_of_birth" date,
                "is_active" boolean NOT NULL DEFAULT true,
                "is_email_verified" boolean NOT NULL DEFAULT false,
                "is_email_verified_at" TIMESTAMP,
                "change_password_by" character varying(255),
                "change_password_at" TIMESTAMP,
                "deleted_by" character varying(255),
                "deleted_at" TIMESTAMP,
                "created_by" character varying(255),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying(255),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "users"."username" IS 'Unique username for the user';
            COMMENT ON COLUMN "users"."email" IS 'Unique email address for the user';
            COMMENT ON COLUMN "users"."password" IS 'Hashed password for the user';
            COMMENT ON COLUMN "users"."first_name" IS 'First name of the user';
            COMMENT ON COLUMN "users"."middle_name" IS 'Middle name of the user';
            COMMENT ON COLUMN "users"."last_name" IS 'Last name of the user';
            COMMENT ON COLUMN "users"."phone" IS 'Phone number of the user';
            COMMENT ON COLUMN "users"."date_of_birth" IS 'Date of birth of the user';
            COMMENT ON COLUMN "users"."is_active" IS 'Whether the user account is active';
            COMMENT ON COLUMN "users"."is_email_verified" IS 'Whether the user email is verified';
            COMMENT ON COLUMN "users"."is_email_verified_at" IS 'Timestamp when the email was verified';
            COMMENT ON COLUMN "users"."change_password_by" IS 'User who changed the password';
            COMMENT ON COLUMN "users"."change_password_at" IS 'Timestamp when the password was changed';
            COMMENT ON COLUMN "users"."deleted_by" IS 'User who deleted the user';
            COMMENT ON COLUMN "users"."created_by" IS 'User who created the user';
            COMMENT ON COLUMN "users"."updated_by" IS 'User who last updated the user'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_073999dfec9d14522f0cf58cd6" ON "users" ("deleted_at")
        `);
        await queryRunner.query(`
            ALTER TABLE "user_permissions"
            ADD CONSTRAINT "FK_3495bd31f1862d02931e8e8d2e8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_permissions"
            ADD CONSTRAINT "FK_8145f5fadacd311693c15e41f10" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "role_permissions"
            ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "role_permissions"
            ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_roles"
            ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_roles"
            ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"
        `);
        await queryRunner.query(`
            ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"
        `);
        await queryRunner.query(`
            ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_permissions" DROP CONSTRAINT "FK_8145f5fadacd311693c15e41f10"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_permissions" DROP CONSTRAINT "FK_3495bd31f1862d02931e8e8d2e8"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_073999dfec9d14522f0cf58cd6"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_fe0bb3f6520ee0469504521e71"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_23ed6f04fe43066df08379fd03"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b23c65e50a758245a33ee35fda"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_87b8888186ca9769c960e92687"
        `);
        await queryRunner.query(`
            DROP TABLE "user_roles"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_7fd0c79dc4e6083ddea850ac38"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_648e3f5447f725579d7d4ffdfb"
        `);
        await queryRunner.query(`
            DROP TABLE "roles"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_25d24010f53bb80b78e412c965"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_17022daf3f885f7d35423e9971"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_178199805b901ccd220ab7740e"
        `);
        await queryRunner.query(`
            DROP TABLE "role_permissions"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_1ea42cae477fc1dc619a5cd280"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_1c1e0637ecf1f6401beb9a68ab"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_89456a09b598ce8915c702c528"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_48ce552495d14eae9b187bb671"
        `);
        await queryRunner.query(`
            DROP TABLE "permissions"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a537c48b1f80e8626a71cb5658"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8145f5fadacd311693c15e41f1"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_3495bd31f1862d02931e8e8d2e"
        `);
        await queryRunner.query(`
            DROP TABLE "user_permissions"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f0215d2793f50225f63db488fd"
        `);
        await queryRunner.query(`
            DROP TABLE "activitylog"
        `);
    }

}
