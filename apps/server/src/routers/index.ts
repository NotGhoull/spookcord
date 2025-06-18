import { serverRouter } from './server';
import { meRouter } from './me';
import { channelRouter } from './channel';
import { userRouter } from './user';
import { authRouter } from './auth';

// THIS IS VERY UNFINISHED
// A lot of functions here are missing authentication checks
// Also, we should split up a lot of these to be in their own files

export const appRouter = {
	server: serverRouter,
	me: meRouter,
	channel: channelRouter,
	user: userRouter,
	auth: authRouter
};

export type AppRouter = typeof appRouter;
