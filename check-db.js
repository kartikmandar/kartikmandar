const { sql } = require('@payloadcms/db-vercel-postgres');
const dotenv = require('dotenv');

dotenv.config();

async function checkDatabase() {
  try {
    // Check if pages_rels table exists
    const result1 = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%pages%rels%'
    `;
    console.log('Tables with pages and rels:', result1.rows);

    // Check columns in any found tables
    for (const row of result1.rows) {
      const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = ${row.table_name}
        ORDER BY ordinal_position
      `;
      console.log(`\nColumns in ${row.table_name}:`, columns.rows);
    }

    // Also check for any relationship tables
    const result2 = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%__rels'
    `;
    console.log('\nAll __rels tables:', result2.rows);

  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkDatabase();