import { generateSupabaseJWT } from '@/lib/bauthjwt';
import type { Context } from '@/lib/context';
import { requireAuth } from '@/lib/orpc';
import { os } from '@orpc/server';

export const authRouter = {
	// We do it like this so we still get the correct typing on the frontend
	// if you use protectedProcedure or private, they loose typing, and
	// it just becomes any
	getJWT: os
		.$context<Context>()
		.use(requireAuth)
		.handler(({ context }) => {
			console.log('Creating with ', context.session.user.id);
			return generateSupabaseJWT(context.session.user.id);
		})
};
