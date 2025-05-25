import { redirect, type Handle } from '@sveltejs/kit';

const AUTH_REDIRECT_PATH = '/login';
const SESSION_COOKIE_NAME = 'better-auth.session_token';

export const handle: Handle = async ({ event, resolve }) => {
	// This is a very bad implementation.
	// We should, eventually, add extra protected paths such as /join/[inviteId] (for joining manors)
	// or /chat/[manorId]/[channelID] <- This is unimplemented right now, though

	// Early exit if we're not trying to access chat (protected)
	if (!event.url.pathname.startsWith('/chat')) {
		return await resolve(event);
	}

	// Get the token
	const token = event.cookies.get(SESSION_COOKIE_NAME);

	// If we don't have a token, redirect to /login with a header to redirect back here
	if (!token) {
		const redirectTo = `${AUTH_REDIRECT_PATH}?redirect=${encodeURIComponent(event.url.pathname)}&reason=unauthorized`;
		return redirect(302, redirectTo);
	}

	// TODO: Here we should check if the session token is valid
	//       since I'm just trying to get quick and dirty implementations, I'll add it later :)
	return await resolve(event);
};
