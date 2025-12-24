// src/common/types/error.types.ts
// Defining a common error type with a message property
export interface IErrorWithMessage extends Error {
	name: string;
	message: string;
}

export interface IIsExceptionObject {
	statusCode: number;
	message: string | string[];
}

// Type guard to check if the error object has a message property
export function isErrorWithMessage(error: unknown): error is IErrorWithMessage {
	return (
		typeof error === 'object' &&
		error !== null &&
		// Must have a message
		'message' in error &&
		typeof (error as Record<string, unknown>).message === 'string' &&
		// Must have a name
		'name' in error &&
		typeof (error as Record<string, unknown>).name === 'string'
	);
}

// Helper function to extract the error message
export function getErrorMessage(error: unknown): string {
	if (isErrorWithMessage(error)) {
		return `${error.name}: ${error.message}`;
	}
	if (typeof error === 'string') {
		return error;
	}
	return 'An unknown error occurred.';
}

export function isExceptionObject(error: unknown): error is IIsExceptionObject {
	return (
		typeof error === 'object' &&
		error !== null &&
		'statusCode' in error &&
		(typeof (error as Record<string, unknown>).statusCode === 'number' ||
			typeof (error as Record<string, unknown>).statusCode === 'string') &&
		'message' in error &&
		(typeof (error as Record<string, unknown>).message === 'string' ||
			Array.isArray((error as Record<string, unknown>).message))
	);
}
