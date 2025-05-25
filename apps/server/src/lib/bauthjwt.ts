import jwt from 'jsonwebtoken';
import { env } from 'bun';

const SUPABASE_JWT_SECRET = env.SUPABASE_JWT_SECRET!; // Very secret

// Theres probably a better way of doing this, but this works for now
export async function generateSupabaseJWT(
	userId: string,
	userRole: string = 'authenticated' // Default
) {
	const payload = {
		sub: userId,
		role: userRole
	};

	const token = jwt.sign(payload, SUPABASE_JWT_SECRET, { expiresIn: '1h' });
	return token;
}
