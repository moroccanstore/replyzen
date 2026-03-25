import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function main() {
  console.log('DEBUG: DATABASE_URL =', process.env.DATABASE_URL);
  process.exit(0);
}

main();
