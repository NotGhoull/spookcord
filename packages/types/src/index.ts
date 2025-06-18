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
	z.literal('Manor')
]);

const ErrorTypeZod = z.union([z.literal('UNKOWN'), z.literal('FORBIDDEN'), z.literal('NOT_FOUND')]);

// This isn't the nicest way of doing it, but its the only way that works properly
export type ErrorDomain = z.infer<typeof ErrorDomainZod>;
export type ErrorFeature = z.infer<typeof ErrorFeatureZod>;
export type ErrorType = z.infer<typeof ErrorTypeZod>;

export type SpookcordErrorCode = `${ErrorDomain}/${ErrorFeature}:${ErrorType}`;

// This feels really over-engineered, there's probably a better way
export const SpookcordErrorCodeSchema = z.string().superRefine((val, ctx) => {
	const parts = val.split(/[/:]/); // Split by / and :
	if (parts.length !== 3) {
		ctx.addIssue({
			code: 'custom',
			message: "SpookcordErrorCode must be in the format 'Domain/Feature:Type'"
		});
		return z.NEVER; // Stop further validation
	}

	const [domain, feature, errorType] = parts;

	// Validate each domain type
	const domainParseResult = ErrorDomainZod.safeParse(domain);
	if (!domainParseResult.success) {
		ctx.addIssue({
			code: 'custom',
			message: `Invalid ErrorDomain: '${domain}'. Must be one of ${ErrorDomainZod.options.map((o) => `'${o.value}'`).join(', ')}`
		});
	}

	const featureParseResult = ErrorFeatureZod.safeParse(domain);
	if (!featureParseResult.success) {
		ctx.addIssue({
			code: 'custom',
			message: `Invalid ErrorFeature: '${feature}'. Must be one of ${ErrorFeatureZod.options.map((o) => `'${o.value}'`).join(', ')}`
		});
	}

	const errorTypeParseResult = ErrorTypeZod.safeParse(domain);
	if (!errorTypeParseResult.success) {
		ctx.addIssue({
			code: 'custom',
			message: `Invalid ErrorType: '${errorType}'. Must be one of ${ErrorTypeZod.options.map((o) => `'${o.value}'`).join(', ')}`
		});
	}
});

export const SpookcordErrorSchema = z.object({
	code: SpookcordErrorCodeSchema,
	message: z.string(),
	timestamp: z.number().optional(),
	details: z.record(z.string(), z.any()).optional()
});

export interface SpookcordError {
	code: SpookcordErrorCode;
	message: string;
	timestamp?: number;
	details?: Record<string, any>;
}
