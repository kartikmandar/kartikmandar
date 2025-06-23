import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Check if projects_id column exists
  const projectsIdExists = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'pages__rels'
      AND column_name = 'projects_id'
    ) as exists;
  `)

  // Add projects_id column if it doesn't exist
  if (!projectsIdExists.rows[0]?.exists) {
    await db.execute(sql`
      ALTER TABLE "pages__rels" ADD COLUMN "projects_id" integer;
    `)

    // Create index
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "pages__rels_projects_id_idx" ON "pages__rels" USING btree ("projects_id");
    `)

    // Add foreign key constraint if projects table exists
    await db.execute(sql`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
          ALTER TABLE "pages__rels" ADD CONSTRAINT "pages__rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
  }

  // Check if talks_id column exists
  const talksIdExists = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'pages__rels'
      AND column_name = 'talks_id'
    ) as exists;
  `)

  // Add talks_id column if it doesn't exist
  if (!talksIdExists.rows[0]?.exists) {
    await db.execute(sql`
      ALTER TABLE "pages__rels" ADD COLUMN "talks_id" integer;
    `)

    // Create index
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "pages__rels_talks_id_idx" ON "pages__rels" USING btree ("talks_id");
    `)

    // Add foreign key constraint if talks table exists
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
  // Remove constraints and columns
  await db.execute(sql`
    ALTER TABLE "pages__rels" DROP CONSTRAINT IF EXISTS "pages__rels_projects_fk";
    ALTER TABLE "pages__rels" DROP CONSTRAINT IF EXISTS "pages__rels_talks_fk";
    DROP INDEX IF EXISTS "pages__rels_projects_id_idx";
    DROP INDEX IF EXISTS "pages__rels_talks_id_idx";
    ALTER TABLE "pages__rels" DROP COLUMN IF EXISTS "projects_id";
    ALTER TABLE "pages__rels" DROP COLUMN IF EXISTS "talks_id";
  `)
}