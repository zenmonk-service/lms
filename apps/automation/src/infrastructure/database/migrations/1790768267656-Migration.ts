import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1790768267656 implements MigrationInterface {
    name = 'Migration1790768267656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "zap" DROP CONSTRAINT "FK_4a3279a0afd9a74185641e027b2"`);
        await queryRunner.query(`ALTER TABLE "zap" DROP CONSTRAINT "UQ_4a3279a0afd9a74185641e027b2"`);
        await queryRunner.query(`ALTER TABLE "zap" DROP COLUMN "trigger_id"`);
        await queryRunner.query(`ALTER TABLE "trigger" DROP COLUMN "order"`);
        await queryRunner.query(`ALTER TABLE "zap" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "zap" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "zap" ADD "trigger_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "zap" ADD CONSTRAINT "UQ_4a3279a0afd9a74185641e027b2" UNIQUE ("trigger_id")`);
        await queryRunner.query(`ALTER TABLE "zap_run" ADD "meta_data" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "zap_run" ADD "order" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "zap" ADD CONSTRAINT "FK_4a3279a0afd9a74185641e027b2" FOREIGN KEY ("trigger_id") REFERENCES "trigger"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "zap" DROP CONSTRAINT "FK_4a3279a0afd9a74185641e027b2"`);
        await queryRunner.query(`ALTER TABLE "zap_run" DROP COLUMN "order"`);
        await queryRunner.query(`ALTER TABLE "zap_run" DROP COLUMN "meta_data"`);
        await queryRunner.query(`ALTER TABLE "zap" DROP CONSTRAINT "UQ_4a3279a0afd9a74185641e027b2"`);
        await queryRunner.query(`ALTER TABLE "zap" DROP COLUMN "trigger_id"`);
        await queryRunner.query(`ALTER TABLE "zap" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "zap" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "trigger" ADD "order" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "zap" ADD "trigger_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "zap" ADD CONSTRAINT "UQ_4a3279a0afd9a74185641e027b2" UNIQUE ("trigger_id")`);
        await queryRunner.query(`ALTER TABLE "zap" ADD CONSTRAINT "FK_4a3279a0afd9a74185641e027b2" FOREIGN KEY ("trigger_id") REFERENCES "trigger"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
