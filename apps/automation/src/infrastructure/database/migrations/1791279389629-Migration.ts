import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1791279389629 implements MigrationInterface {
    name = 'Migration1791279389629'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "available-trigger" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "UQ_850efcfb38943922a341eae2bd5" UNIQUE ("uuid"), CONSTRAINT "PK_d802c2fea3f8886bc9d27007529" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trigger" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "available_trigger_id" integer NOT NULL, CONSTRAINT "UQ_71a220d2f08f6278f1638bdb5f8" UNIQUE ("uuid"), CONSTRAINT "REL_5c7a8985d9abf0f75f4c7634fa" UNIQUE ("available_trigger_id"), CONSTRAINT "PK_fc6b3cbbe199d89c002831e03e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "available-action" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "UQ_a4391f64c114c87cdf602854f5a" UNIQUE ("uuid"), CONSTRAINT "PK_9d677dcc387deff0412c4667176" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "action" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "available_action_id" integer NOT NULL, "order" SERIAL NOT NULL, "zap_id" integer NOT NULL, CONSTRAINT "UQ_3d098eae105d38b5f16e2156bd7" UNIQUE ("uuid"), CONSTRAINT "REL_c52944c85151c36af8f0bdd348" UNIQUE ("available_action_id"), CONSTRAINT "PK_2d9db9cf5edfbbae74eb56e3a39" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "outbox-message" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "zap_run_id" integer NOT NULL, CONSTRAINT "UQ_8118ce2ba861050664464896351" UNIQUE ("uuid"), CONSTRAINT "PK_0532c5b5376d3ea5a658b9d7925" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "zap_run" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "zap_id" integer NOT NULL, "meta_data" jsonb NOT NULL, "order" SERIAL NOT NULL, CONSTRAINT "UQ_3c8685313330deffcd9f177adce" UNIQUE ("uuid"), CONSTRAINT "PK_de3b149b247fdfb679be94bd870" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "zap" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "trigger_id" integer NOT NULL, CONSTRAINT "UQ_12e9416cbac4ee207c131bb4508" UNIQUE ("uuid"), CONSTRAINT "REL_4a3279a0afd9a74185641e027b" UNIQUE ("trigger_id"), CONSTRAINT "PK_c84ea935b796059a4453a9a7974" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "trigger" ADD CONSTRAINT "FK_5c7a8985d9abf0f75f4c7634fae" FOREIGN KEY ("available_trigger_id") REFERENCES "available-trigger"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action" ADD CONSTRAINT "FK_c52944c85151c36af8f0bdd348a" FOREIGN KEY ("available_action_id") REFERENCES "available-action"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action" ADD CONSTRAINT "FK_37f55846c4775b57ec9e001ad70" FOREIGN KEY ("zap_id") REFERENCES "zap"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "outbox-message" ADD CONSTRAINT "FK_b893a047015699c96f685b70ff1" FOREIGN KEY ("zap_run_id") REFERENCES "zap_run"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "zap_run" ADD CONSTRAINT "FK_d023f87ad8a6160fb8afea8af8b" FOREIGN KEY ("zap_id") REFERENCES "zap"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "zap" ADD CONSTRAINT "FK_4a3279a0afd9a74185641e027b2" FOREIGN KEY ("trigger_id") REFERENCES "trigger"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "zap" DROP CONSTRAINT "FK_4a3279a0afd9a74185641e027b2"`);
        await queryRunner.query(`ALTER TABLE "zap_run" DROP CONSTRAINT "FK_d023f87ad8a6160fb8afea8af8b"`);
        await queryRunner.query(`ALTER TABLE "outbox-message" DROP CONSTRAINT "FK_b893a047015699c96f685b70ff1"`);
        await queryRunner.query(`ALTER TABLE "action" DROP CONSTRAINT "FK_37f55846c4775b57ec9e001ad70"`);
        await queryRunner.query(`ALTER TABLE "action" DROP CONSTRAINT "FK_c52944c85151c36af8f0bdd348a"`);
        await queryRunner.query(`ALTER TABLE "trigger" DROP CONSTRAINT "FK_5c7a8985d9abf0f75f4c7634fae"`);
        await queryRunner.query(`DROP TABLE "zap"`);
        await queryRunner.query(`DROP TABLE "zap_run"`);
        await queryRunner.query(`DROP TABLE "outbox-message"`);
        await queryRunner.query(`DROP TABLE "action"`);
        await queryRunner.query(`DROP TABLE "available-action"`);
        await queryRunner.query(`DROP TABLE "trigger"`);
        await queryRunner.query(`DROP TABLE "available-trigger"`);
    }

}
