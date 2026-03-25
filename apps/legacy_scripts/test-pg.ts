import { Client } from 'pg';
import 'dotenv/config';

async function test() {
  console.log(
    'Testing connection to:',
    process.env.DATABASE_URL?.split('@')[1],
  );
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  try {
    await client.connect();
    console.log('Successfully connected to PG!');
    const res = await client.query('SELECT NOW()');
    console.log('Result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('PG Connection Error:', err);
  }
}
test();
