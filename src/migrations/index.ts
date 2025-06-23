import * as migration_20250621_140000_add_missing_block_tables from './20250621_140000_add_missing_block_tables';
import * as migration_20250622_112307_fix_pages_rels_table_safe from './20250622_112307_fix_pages_rels_table_safe';

export const migrations = [
  {
    up: migration_20250621_140000_add_missing_block_tables.up,
    down: migration_20250621_140000_add_missing_block_tables.down,
    name: '20250621_140000_add_missing_block_tables',
  },
  {
    up: migration_20250622_112307_fix_pages_rels_table_safe.up,
    down: migration_20250622_112307_fix_pages_rels_table_safe.down,
    name: '20250622_112307_fix_pages_rels_table_safe'
  },
];
