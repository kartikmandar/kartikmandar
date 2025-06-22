import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
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

  // Create indexes for cosmic journey
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pages_blocks_cosmic_journey_order_idx" ON "pages_blocks_cosmic_journey" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_cosmic_journey_parent_id_idx" ON "pages_blocks_cosmic_journey" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_cosmic_journey_path_idx" ON "pages_blocks_cosmic_journey" USING btree ("_path");
  `)

  // Add foreign key constraint for cosmic journey
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

  // Create indexes for cosmic journey versions table
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cosmic_journey_order_idx" ON "_pages_v_blocks_cosmic_journey" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cosmic_journey_parent_id_idx" ON "_pages_v_blocks_cosmic_journey" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cosmic_journey_path_idx" ON "_pages_v_blocks_cosmic_journey" USING btree ("_path");
  `)

  // Add foreign key constraint for cosmic journey versions
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "_pages_v_blocks_cosmic_journey" ADD CONSTRAINT "_pages_v_blocks_cosmic_journey_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Create the pages_blocks_projects_showcase table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_projects_showcase" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "subtitle" varchar,
      "show_all_projects" boolean,
      "show_featured_only" boolean,
      "max_projects" numeric,
      "layout" varchar,
      "show_view_all_button" boolean,
      "view_all_button_text" varchar,
      "view_all_button_url" varchar,
      "block_name" varchar
    );
  `)

  // Create indexes for projects showcase
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pages_blocks_projects_showcase_order_idx" ON "pages_blocks_projects_showcase" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_projects_showcase_parent_id_idx" ON "pages_blocks_projects_showcase" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_projects_showcase_path_idx" ON "pages_blocks_projects_showcase" USING btree ("_path");
  `)

  // Add foreign key constraint for projects showcase
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "pages_blocks_projects_showcase" ADD CONSTRAINT "pages_blocks_projects_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Create the _pages_v_blocks_projects_showcase table for versions
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_projects_showcase" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "subtitle" varchar,
      "show_all_projects" boolean,
      "show_featured_only" boolean,
      "max_projects" numeric,
      "layout" varchar,
      "show_view_all_button" boolean,
      "view_all_button_text" varchar,
      "view_all_button_url" varchar,
      "block_name" varchar,
      "_uuid" varchar
    );
  `)

  // Create indexes for projects showcase versions table
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_projects_showcase_order_idx" ON "_pages_v_blocks_projects_showcase" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_projects_showcase_parent_id_idx" ON "_pages_v_blocks_projects_showcase" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_projects_showcase_path_idx" ON "_pages_v_blocks_projects_showcase" USING btree ("_path");
  `)

  // Add foreign key constraint for projects showcase versions
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "_pages_v_blocks_projects_showcase" ADD CONSTRAINT "_pages_v_blocks_projects_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Create the pages_blocks_talks_showcase table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_talks_showcase" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "subtitle" varchar,
      "show_all_talks" boolean,
      "show_featured_only" boolean,
      "max_talks" numeric,
      "layout" varchar,
      "show_view_all_button" boolean,
      "view_all_button_text" varchar,
      "view_all_button_url" varchar,
      "block_name" varchar
    );
  `)

  // Create indexes for talks showcase
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pages_blocks_talks_showcase_order_idx" ON "pages_blocks_talks_showcase" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_talks_showcase_parent_id_idx" ON "pages_blocks_talks_showcase" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_talks_showcase_path_idx" ON "pages_blocks_talks_showcase" USING btree ("_path");
  `)

  // Add foreign key constraint for talks showcase
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "pages_blocks_talks_showcase" ADD CONSTRAINT "pages_blocks_talks_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Create the _pages_v_blocks_talks_showcase table for versions
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_talks_showcase" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "subtitle" varchar,
      "show_all_talks" boolean,
      "show_featured_only" boolean,
      "max_talks" numeric,
      "layout" varchar,
      "show_view_all_button" boolean,
      "view_all_button_text" varchar,
      "view_all_button_url" varchar,
      "block_name" varchar,
      "_uuid" varchar
    );
  `)

  // Create indexes for talks showcase versions table
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_talks_showcase_order_idx" ON "_pages_v_blocks_talks_showcase" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_talks_showcase_parent_id_idx" ON "_pages_v_blocks_talks_showcase" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_talks_showcase_path_idx" ON "_pages_v_blocks_talks_showcase" USING btree ("_path");
  `)

  // Add foreign key constraint for talks showcase versions
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "_pages_v_blocks_talks_showcase" ADD CONSTRAINT "_pages_v_blocks_talks_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Create join tables for projects showcase
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_projects_showcase_projects" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "projects_id" integer
    );
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pages_blocks_projects_showcase_projects_order_idx" ON "pages_blocks_projects_showcase_projects" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_projects_showcase_projects_parent_id_idx" ON "pages_blocks_projects_showcase_projects" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_projects_showcase_projects_projects_id_idx" ON "pages_blocks_projects_showcase_projects" USING btree ("projects_id");
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "pages_blocks_projects_showcase_projects" ADD CONSTRAINT "pages_blocks_projects_showcase_projects_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_projects_showcase"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Only add foreign key to projects table if it exists
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        ALTER TABLE "pages_blocks_projects_showcase_projects" ADD CONSTRAINT "pages_blocks_projects_showcase_projects_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Create join tables for projects showcase versions
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_projects_showcase_projects" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "projects_id" integer,
      "_uuid" varchar
    );
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_projects_showcase_projects_order_idx" ON "_pages_v_blocks_projects_showcase_projects" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_projects_showcase_projects_parent_id_idx" ON "_pages_v_blocks_projects_showcase_projects" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_projects_showcase_projects_projects_id_idx" ON "_pages_v_blocks_projects_showcase_projects" USING btree ("projects_id");
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "_pages_v_blocks_projects_showcase_projects" ADD CONSTRAINT "_pages_v_blocks_projects_showcase_projects_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "_pages_v_blocks_projects_showcase"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Only add foreign key to projects table if it exists
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        ALTER TABLE "_pages_v_blocks_projects_showcase_projects" ADD CONSTRAINT "_pages_v_blocks_projects_showcase_projects_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Create join tables for talks showcase
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_talks_showcase_talks" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "talks_id" integer
    );
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pages_blocks_talks_showcase_talks_order_idx" ON "pages_blocks_talks_showcase_talks" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_talks_showcase_talks_parent_id_idx" ON "pages_blocks_talks_showcase_talks" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_talks_showcase_talks_talks_id_idx" ON "pages_blocks_talks_showcase_talks" USING btree ("talks_id");
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "pages_blocks_talks_showcase_talks" ADD CONSTRAINT "pages_blocks_talks_showcase_talks_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_talks_showcase"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Only add foreign key to talks table if it exists
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'talks') THEN
        ALTER TABLE "pages_blocks_talks_showcase_talks" ADD CONSTRAINT "pages_blocks_talks_showcase_talks_talks_fk" FOREIGN KEY ("talks_id") REFERENCES "talks"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Create join tables for talks showcase versions
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_talks_showcase_talks" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "talks_id" integer,
      "_uuid" varchar
    );
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_talks_showcase_talks_order_idx" ON "_pages_v_blocks_talks_showcase_talks" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_talks_showcase_talks_parent_id_idx" ON "_pages_v_blocks_talks_showcase_talks" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_talks_showcase_talks_talks_id_idx" ON "_pages_v_blocks_talks_showcase_talks" USING btree ("talks_id");
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "_pages_v_blocks_talks_showcase_talks" ADD CONSTRAINT "_pages_v_blocks_talks_showcase_talks_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "_pages_v_blocks_talks_showcase"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Only add foreign key to talks table if it exists
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'talks') THEN
        ALTER TABLE "_pages_v_blocks_talks_showcase_talks" ADD CONSTRAINT "_pages_v_blocks_talks_showcase_talks_talks_fk" FOREIGN KEY ("talks_id") REFERENCES "talks"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_pages_v_blocks_talks_showcase_talks" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_talks_showcase_talks" CASCADE;
    DROP TABLE IF EXISTS "_pages_v_blocks_projects_showcase_projects" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_projects_showcase_projects" CASCADE;
    DROP TABLE IF EXISTS "_pages_v_blocks_talks_showcase" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_talks_showcase" CASCADE;
    DROP TABLE IF EXISTS "_pages_v_blocks_projects_showcase" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_projects_showcase" CASCADE;
    DROP TABLE IF EXISTS "_pages_v_blocks_cosmic_journey" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_cosmic_journey" CASCADE;
  `)
}