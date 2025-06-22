import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Create the pages_blocks_cosmic_journey table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_cosmic_journey" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "subtitle" varchar,
      "block_name" varchar
    );
  `)

  // Create indexes
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pages_blocks_cosmic_journey_order_idx" ON "pages_blocks_cosmic_journey" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_cosmic_journey_parent_id_idx" ON "pages_blocks_cosmic_journey" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_cosmic_journey_path_idx" ON "pages_blocks_cosmic_journey" USING btree ("_path");
  `)

  // Add foreign key constraint
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "pages_blocks_cosmic_journey" ADD CONSTRAINT "pages_blocks_cosmic_journey_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Create the _pages_v_blocks_cosmic_journey table for versions
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_cosmic_journey" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "subtitle" varchar,
      "block_name" varchar,
      "_uuid" varchar
    );
  `)

  // Create indexes for versions table
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cosmic_journey_order_idx" ON "_pages_v_blocks_cosmic_journey" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cosmic_journey_parent_id_idx" ON "_pages_v_blocks_cosmic_journey" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cosmic_journey_path_idx" ON "_pages_v_blocks_cosmic_journey" USING btree ("_path");
  `)

  // Add foreign key constraint for versions
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "_pages_v_blocks_cosmic_journey" ADD CONSTRAINT "_pages_v_blocks_cosmic_journey_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_pages_v_blocks_cosmic_journey" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_cosmic_journey" CASCADE;
  `)
}