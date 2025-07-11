import { os, ORPCError } from '@orpc/server';
import type { Context } from './context';

export const o = os.$context<Context>();

export const publicProcedure = o;

export const requireAuth = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError('UNAUTHORIZED', {
			message: 'Missing authorization',
			data: {
				code: 'Backend/Auth:FORBIDDEN'
			}
		});
	}
	return next({
		context: {
			...context,
			session: context.session
		}
	});
});

export const protectedProcedure = publicProcedure.use(requireAuth);
