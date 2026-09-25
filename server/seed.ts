import dotenv from 'dotenv';
dotenv.config();

import { DBStorage } from './db/storage.js';

console.log('--- Printing Dashboard Database Seeding ---');
try {
  const seed = DBStorage.resetToSeed();
  console.log(`Successfully seeded database:`);
  console.log(`- ${seed.users.length} Users`);
  console.log(`- ${seed.printers.length} Printers`);
  console.log(`- ${seed.jobs.length} Print Jobs`);
  console.log(`- ${seed.documents.length} Documents`);
  console.log(`- ${seed.activities.length} System Activities`);
  console.log('Seed completed successfully!');
  process.exit(0);
} catch (err) {
  console.error('Failed to seed database:', err);
  process.exit(1);
}
