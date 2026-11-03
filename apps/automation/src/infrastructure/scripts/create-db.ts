import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

async function createDatabase() {
  const databaseName =
    process.env.DB_DATABASE || process.env.DB_NAME || 'my_nestjs_db';
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_ADMIN_DATABASE || 'postgres',
    ssl: process.env.DB_SSL === 'true',
  });

  try {
    await client.connect();

    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName],
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
      console.log(`Database "${databaseName}" created successfully!`);
    } else {
      console.log(`Database "${databaseName}" already exists.`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

void createDatabase();