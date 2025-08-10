// This should probably be moved to @spookcord/db-schema

import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from '@spookcord/db-schema';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';

export const db = drizzle(process.env.DATABASE_URL || '', { schema });

export async function runMigrations() {
	console.info('[database] Running migrations');
	try {
		await migrate(db, { migrationsFolder: './src/db/migrations' });
		console.log('[database] OK');
		await checkRealtime();
	} catch (error) {
		console.error(
			'[database] FAIL | Migrations failed \n',
			error,
			'\n - This error should be reported. (This is an unrecoverable error)'
		);
		process.exit(1);
	}
}

async function checkRealtime() {
	console.log('[database] Checking realtime');

	try {
		// Check if we already have the function
		const functionExistsResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1
        FROM pg_proc
        WHERE proname = 'add_table_to_realtime'
      )
    `);

		// Do we really need .exists?
		const functionExists = functionExistsResult.rows[0]?.exists || false;

		if (!functionExists) {
			// Create the function
			console.warn("[database] WARN function doesn't exist, created");
			await db.execute(sql`
          CREATE OR REPLACE FUNCTION add_table_to_realtime(_table_name text)
          RETURNS text AS
          $$
          BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I;', _table_name);
            RETURN 'success';
          EXCEPTION
            WHEN duplicate_object THEN
                RETURN 'Table already exists';
            WHEN OTHERS THEN
                RAISE;
          END
          $$ LANGUAGE 'plpgsql';
        `);
			console.info('[database] OK, created.');
		} else {
			console.debug('[database] DBG Function exists');
		}

		const tableExistsResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'message'
      )
    `);

		const tableExists = tableExistsResult.rows[0].exists || false;

		if (tableExists) {
			const result = await db.execute(sql`
        SELECT add_table_to_realtime('message');
      `);

			const status = result.rows[0].add_table_to_realtime || 'unknown';

			switch (status) {
				case 'success':
					console.log('[database] OK table successfully added.');
					break;
				case 'Table already exists':
					console.debug('[database] OK table aready exists');
					break;
				default:
					console.error('[database] WARN an unexpected error occurred ', status);
			}
			return;
		}

		console.error("[database] FAIL no table named 'message' found!");
	} catch (error) {
		console.error(
			'[database] FAIL | Realtime table failed\n',
			error,
			"\n |-> Continuning anyway, your messages won't appear in realtime."
		);
	}
}
