import * as migration_20250621_140000_add_missing_block_tables from './20250621_140000_add_missing_block_tables';

export const migrations = [
  {
    up: migration_20250621_140000_add_missing_block_tables.up,
    down: migration_20250621_140000_add_missing_block_tables.down,
    name: '20250621_140000_add_missing_block_tables'
  },
];
