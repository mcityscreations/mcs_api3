// src/common/validators/error.validator.ts
import { IErrorWithMessage, IIsExceptionObject } from '../types/error.types.js';

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

export function isInstanceofError(error: unknown): error is Error {
	return error instanceof Error;
}

/** Type guard function for NestJS exceptions (HttpException)*/
export function isNestHttpException(
	// Use 'unknow' instead of 'any' for better type safety
	error: unknown,
): error is {
	getStatus: () => number;
	getResponse: () => { message: string };
} {
	// Basic verification that error is an object
	if (typeof error !== 'object' || error === null) {
		return false;
	}

	// Checking that getStatus exists !
	const hasGetStatus = 'getStatus' in (error as Record<string, unknown>);
	const hasGetResponse = 'getResponse' in (error as Record<string, unknown>);

	// If either getStatus or getResponse is missing, it's not a NestJS HttpException
	if (!hasGetStatus || !hasGetResponse) {
		return false;
	}

	// Checking that getStatus is a function
	const getStatusFn = (error as { getStatus: unknown }).getStatus;
	const getResponseFn = (error as { getResponse: unknown }).getResponse;
	return (
		typeof getStatusFn === 'function' && typeof getResponseFn === 'function'
	);
}
