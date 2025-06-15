import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	// We should probably add an export from @spookcord/
	schema: '../../packages/db-schema/src/schema.ts',
	out: './src/db/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL || ''
	},
	entities: {
		roles: {
			provider: 'supabase'
		}
	},
	migrations: {
		prefix: 'supabase',
		table: 'journal',
		schema: 'drizzle'
	},
	verbose: true,
	strict: true
});
