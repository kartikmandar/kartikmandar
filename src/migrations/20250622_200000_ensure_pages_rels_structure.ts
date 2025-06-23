import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Check if pages_rels table exists and has the correct structure
  const result = await db.execute(sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'pages__rels' 
    AND column_name = 'projects_id'
  `)

  // If the column doesn't exist, add it
  if (result.rows.length === 0) {
    await db.execute(sql`
      ALTER TABLE "pages__rels" 
      ADD COLUMN IF NOT EXISTS "projects_id" integer
    `)

    // Create index for the new column
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "pages__rels_projects_id_idx" 
      ON "pages__rels" USING btree ("projects_id")
    `)

    // Add foreign key constraint if projects table exists
    await db.execute(sql`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
          ALTER TABLE "pages__rels" 
          ADD CONSTRAINT "pages__rels_projects_fk" 
          FOREIGN KEY ("projects_id") 
          REFERENCES "projects"("id") 
          ON DELETE cascade 
          ON UPDATE no action;
        END IF;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Remove the constraint first
  await db.execute(sql`
    ALTER TABLE "pages__rels" 
    DROP CONSTRAINT IF EXISTS "pages__rels_projects_fk"
  `)

  // Drop the index
  await db.execute(sql`
    DROP INDEX IF EXISTS "pages__rels_projects_id_idx"
  `)

  // Remove the column
  await db.execute(sql`
    ALTER TABLE "pages__rels" 
    DROP COLUMN IF EXISTS "projects_id"
  `)
}