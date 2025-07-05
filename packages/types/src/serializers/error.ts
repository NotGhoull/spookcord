import type { StandardRPCCustomJsonSerializer } from '@orpc/client/standard';

export const rawErrorSerializer: StandardRPCCustomJsonSerializer = {
	type: 21,
	// Only proceed if 'data' is an object and contains "defined"
	condition: (data) => data instanceof Object && 'defined' in data,

	serialize: (data) => {
		console.warn('[api:intercept] Response was hijacked, try not to rely on this');

		return {
			success: false,
			error: {
				code: data?.data?.code ?? 'Backend/Internal:Unknown',
				message: data?.message ?? 'Unknown error',
				timestamp: new Date().getTime(),
				$__INTERNAL_DONT_PARSE: true,

				details: data?.data?.extra
					? {
							$__INTERNAL_DONT_PARSE: true,
							...data?.data?.extra
						}
					: undefined
			}
		};
	},

	deserialize: (data) => {
		console.warn(
			"[api:intercept] Deserialize is not implemented! Why are you even calling it, we don't use it"
		);
		return {};
	}
};
