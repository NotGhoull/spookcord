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
	z.literal('INVALID_DATA')
]);

// This isn't the nicest way of doing it, but its the only way that works properly
export type ErrorDomain = z.infer<typeof ErrorDomainZod>;
export type ErrorFeature = z.infer<typeof ErrorFeatureZod>;
export type ErrorType = z.infer<typeof ErrorTypeZod>;

export type SpookcordErrorCode = `${ErrorDomain}/${ErrorFeature}:${ErrorType}`;

export const SpookcordErrorSchema = z.object({
	code: z.templateLiteral([ErrorDomainZod, ':', ErrorFeatureZod, '/', ErrorTypeZod]),
	message: z.string(),
	timestamp: z.number().optional().default(new Date().getTime()),
	details: z.record(z.any(), z.any()).optional()
});

export interface SpookcordError {
	code: SpookcordErrorCode;
	message: string;
	timestamp?: number;
	details?: Record<string, any>;
}

export const BaseSpookcordResponseSchema = z.object({
	// These shouldn't be modified
	success: z.boolean(),
	error: SpookcordErrorSchema.optional(),

	// Response should be extended by the output
	response: z.record(z.string(), z.any()).optional()
});
