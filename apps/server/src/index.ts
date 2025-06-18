import 'dotenv/config';
import { RPCHandler } from '@orpc/server/fetch';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { auth } from './lib/auth';
import { createContext } from './lib/context';
import { appRouter } from './routers/index';
import z from 'zod/v4';
import { env } from 'bun';

// Envrioment variable stuff
const envSchema = z.object({
	CORS_ORIGIN: z.url(),
	BETTER_AUTH_SECRET: z
		.string()
		.min(15, 'Please make sure your secret is secure. (Must be at least 15 characters)'),
	BETTER_AUTH_URL: z.url(),
	DATABASE_URL: z.url({ protocol: /^postgresql$/ }),
	SUPABASE_JWT_SECRET: z.string().min(15, 'Please make sure your JWT_SECRET is secure.'),
	PORT: z.number('Port must be a number').optional().default(3000)
	// COMPRESSION_TYPE: z.enum(["AVIF", "WEBP"], "Compression type should be either 'AVIF' or 'WEBP'\nWhat each one does\n AVIF - Offers superior compression and quality for photographic content, often resulting in smaller file sizes than WebP at comparable quality.\n WEBP - Provides excellent all-around compression with wide browser support, balancing good quality with reduced file sizes for various image types.")
});

const result = envSchema.safeParse({
	...env
});

if (result.error) {
	const pretty = z.prettifyError(result.error);
	throw new Error(`Please fix enviroment variable errors.\n\n${pretty}`);
}

console.log('Enviroment OK!');

const app = new Hono();

app.use(logger());
app.use(
	'/*',
	cors({
		origin: [process.env.CORS_ORIGIN || ''],
		allowMethods: ['GET', 'POST', 'OPTIONS'],
		allowHeaders: ['Content-Type', 'Authorization'],
		credentials: true
	})
);

app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw));

const handler = new RPCHandler(appRouter);
app.use('/rpc/*', async (c, next) => {
	const context = await createContext({ context: c });
	const { matched, response } = await handler.handle(c.req.raw, {
		prefix: '/rpc',
		context: context
	});
	if (matched) {
		return c.newResponse(response.body, response);
	}
	await next();
});

app.get('/', (c) => {
	return c.text('OK');
});

export default {
	port: 3000,
	fetch: app.fetch
};
