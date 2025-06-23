import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // First, drop the existing pages__rels table if it exists (it might have wrong structure)
  await db.execute(sql`
    DROP TABLE IF EXISTS "pages__rels" CASCADE;
  `)

  // Recreate pages__rels table with correct structure
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

  // Create indexes for pages__rels
  await db.execute(sql`
    CREATE INDEX "pages__rels_order_idx" ON "pages__rels" USING btree ("order");
    CREATE INDEX "pages__rels_parent_idx" ON "pages__rels" USING btree ("parent_id");
    CREATE INDEX "pages__rels_path_idx" ON "pages__rels" USING btree ("path");
    CREATE INDEX "pages__rels_categories_id_idx" ON "pages__rels" USING btree ("categories_id");
    CREATE INDEX "pages__rels_posts_id_idx" ON "pages__rels" USING btree ("posts_id");
    CREATE INDEX "pages__rels_projects_id_idx" ON "pages__rels" USING btree ("projects_id");
    CREATE INDEX "pages__rels_talks_id_idx" ON "pages__rels" USING btree ("talks_id");
  `)

  // Add foreign key constraints for pages__rels
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pages') THEN
        ALTER TABLE "pages__rels" ADD CONSTRAINT "pages__rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Add other foreign keys conditionally
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

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Drop the pages__rels table
  await db.execute(sql`
    DROP TABLE IF EXISTS "pages__rels" CASCADE;
  `)
}