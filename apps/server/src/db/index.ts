// This should probably be moved to @spookcord/db-schema

import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from '@spookcord/db-schema';

export const db = drizzle(process.env.DATABASE_URL || '', { schema });
