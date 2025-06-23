import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Create enum types if they don't exist
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_hero_links_link_type" AS ENUM('reference', 'custom');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_archive_populate_by" AS ENUM('collection', 'selection');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_archive_relation_to" AS ENUM('posts');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_projects_showcase_layout" AS ENUM('grid-3', 'grid-2', 'grid-4', 'mixed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_talks_showcase_layout" AS ENUM('grid-3', 'grid-2', 'grid-4', 'mixed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Check if the pages__rels table exists
  const tableExists = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'pages__rels'
    ) as exists;
  `)

  // Only create the table if it doesn't exist
  if (!tableExists.rows[0].exists) {
    // Create pages__rels table
    await db.execute(sql`
      CREATE TABLE "pages__rels" (
        "id" serial PRIMARY KEY NOT NULL,
        "order" integer,
        "parent_id" integer NOT NULL,
        "path" text NOT NULL,
        "categories_id" integer,
        "posts_id" integer,
        "projects_id" integer,
        "talks_id" integer
      );
    `)

    // Create indexes
    await db.execute(sql`
      CREATE INDEX "pages__rels_order_idx" ON "pages__rels" USING btree ("order");
      CREATE INDEX "pages__rels_parent_idx" ON "pages__rels" USING btree ("parent_id");
      CREATE INDEX "pages__rels_path_idx" ON "pages__rels" USING btree ("path");
      CREATE INDEX "pages__rels_categories_id_idx" ON "pages__rels" USING btree ("categories_id");
      CREATE INDEX "pages__rels_posts_id_idx" ON "pages__rels" USING btree ("posts_id");
      CREATE INDEX "pages__rels_projects_id_idx" ON "pages__rels" USING btree ("projects_id");
      CREATE INDEX "pages__rels_talks_id_idx" ON "pages__rels" USING btree ("talks_id");
    `)

    // Add foreign key constraints
    await db.execute(sql`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pages') THEN
          ALTER TABLE "pages__rels" ADD CONSTRAINT "pages__rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "pages"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await db.execute(sql`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
          ALTER TABLE "pages__rels" ADD CONSTRAINT "pages__rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await db.execute(sql`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
          ALTER TABLE "pages__rels" ADD CONSTRAINT "pages__rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await db.execute(sql`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
          ALTER TABLE "pages__rels" ADD CONSTRAINT "pages__rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await db.execute(sql`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'talks') THEN
          ALTER TABLE "pages__rels" ADD CONSTRAINT "pages__rels_talks_fk" FOREIGN KEY ("talks_id") REFERENCES "talks"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Drop the pages__rels table
  await db.execute(sql`
    DROP TABLE IF EXISTS "pages__rels" CASCADE;
  `)
}