import * as migration_20250621_140000_add_cosmic_journey_tables from './20250621_140000_add_cosmic_journey_tables';

export const migrations = [
  {
    up: migration_20250621_140000_add_cosmic_journey_tables.up,
    down: migration_20250621_140000_add_cosmic_journey_tables.down,
    name: '20250621_140000_add_cosmic_journey_tables'
  },
];
