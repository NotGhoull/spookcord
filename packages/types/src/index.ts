import { z } from 'zod/v4';

const ErrorDomainZod = z.union([
	z.literal('Client'),
	z.literal('Backend'),
	z.literal('Database'),
	z.literal('External')
]);

const ErrorFeatureZod = z.union([
	z.literal('Auth'),
	z.literal('Messaging'),
	z.literal('User'),
	z.literal('Validation'),
	z.literal('Manor'),
	z.literal('Internal')
]);

const ErrorTypeZod = z.union([
	z.literal('UNKNOWN'),
	z.literal('FORBIDDEN'),
	z.literal('NOT_FOUND'),
	z.literal('INVALID_DATA'),
	z.literal('INTERNAL_ERROR'),
	z.literal('CONFLICT')
]);

export const SpookcordErrorSchema = z.object({
	code: z.templateLiteral([ErrorDomainZod, ':', ErrorFeatureZod, '/', ErrorTypeZod]),
	message: z.string(),
	timestamp: z
		.number()
		.optional()
		.default(() => new Date().getTime()),
	details: z.record(z.any(), z.any()).optional()
});

export const BaseSpookcordResponseSchema = z.object({
	// These shouldn't be modified
	success: z.boolean(),
	error: SpookcordErrorSchema.optional(),

	// Response should be extended by the output
	response: z.record(z.string(), z.any()).optional()
});
