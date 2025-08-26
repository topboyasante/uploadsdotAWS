import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUploadsTable1756220779203 implements MigrationInterface {
  name = 'AddUploadsTable1756220779203';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "upload" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "metadata" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_1fe8db121b3de4ddfa677fc51f3" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "upload"`);
  }
}
