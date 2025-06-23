import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // First check if the pages__rels table exists
  const tableExists = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'pages__rels'
    ) as exists;
  `)

  if (tableExists.rows[0]?.exists) {
    // Table exists, check which columns are missing and add them
    
    // Check all required columns
    const columnChecks = await db.execute(sql`
      SELECT 
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'pages__rels'
      AND column_name IN ('id', 'order', 'parent_id', 'path', 'categories_id', 'posts_id', 'projects_id', 'talks_id');
    `)
    
    const existingColumns = new Set(columnChecks.rows.map(row => row.column_name))
    
    // Add missing columns
    const columnsToAdd = [
      { name: 'projects_id', type: 'integer' },
      { name: 'talks_id', type: 'integer' },
      { name: 'categories_id', type: 'integer' },
      { name: 'posts_id', type: 'integer' }
    ]
    
    for (const column of columnsToAdd) {
      if (!existingColumns.has(column.name)) {
        await db.execute(sql`
          ALTER TABLE "pages__rels" ADD COLUMN "${sql.raw(column.name)}" ${sql.raw(column.type)};
        `)
        
        // Create index for the new column
        await db.execute(sql`
          CREATE INDEX IF NOT EXISTS "pages__rels_${sql.raw(column.name)}_idx" ON "pages__rels" USING btree ("${sql.raw(column.name)}");
        `)
      }
    }
    
    // Add foreign key constraints if they don't exist
    const constraintsToAdd = [
      { column: 'categories_id', table: 'categories', constraint: 'pages__rels_categories_fk' },
      { column: 'posts_id', table: 'posts', constraint: 'pages__rels_posts_fk' },
      { column: 'projects_id', table: 'projects', constraint: 'pages__rels_projects_fk' },
      { column: 'talks_id', table: 'talks', constraint: 'pages__rels_talks_fk' }
    ]
    
    for (const { column, table, constraint } of constraintsToAdd) {
      if (existingColumns.has(column) || columnsToAdd.some(c => c.name === column)) {
        await db.execute(sql`
          DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${sql.raw(table)}')
               AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = '${sql.raw(constraint)}') THEN
              ALTER TABLE "pages__rels" ADD CONSTRAINT "${sql.raw(constraint)}" 
                FOREIGN KEY ("${sql.raw(column)}") REFERENCES "${sql.raw(table)}"("id") 
                ON DELETE cascade ON UPDATE no action;
            END IF;
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `)
      }
    }
  } else {
    // If table doesn't exist at all, create it with all columns
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
    
    // Create all indexes
    await db.execute(sql`
      CREATE INDEX "pages__rels_order_idx" ON "pages__rels" USING btree ("order");
      CREATE INDEX "pages__rels_parent_idx" ON "pages__rels" USING btree ("parent_id");
      CREATE INDEX "pages__rels_path_idx" ON "pages__rels" USING btree ("path");
      CREATE INDEX "pages__rels_categories_id_idx" ON "pages__rels" USING btree ("categories_id");
      CREATE INDEX "pages__rels_posts_id_idx" ON "pages__rels" USING btree ("posts_id");
      CREATE INDEX "pages__rels_projects_id_idx" ON "pages__rels" USING btree ("projects_id");
      CREATE INDEX "pages__rels_talks_id_idx" ON "pages__rels" USING btree ("talks_id");
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Remove only the columns we added
  await db.execute(sql`
    ALTER TABLE "pages__rels" 
      DROP COLUMN IF EXISTS "projects_id",
      DROP COLUMN IF EXISTS "talks_id";
  `)
}