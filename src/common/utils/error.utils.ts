import { isErrorWithMessage } from '../validators/error.validators.js';
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
