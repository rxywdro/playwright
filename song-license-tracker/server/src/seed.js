import { db } from './db.js';
import { seedDatabase } from './seedData.js';

const { songCount, contractCount } = seedDatabase(db);
console.log(`Seeded ${songCount} songs and ${contractCount} contracts.`);
