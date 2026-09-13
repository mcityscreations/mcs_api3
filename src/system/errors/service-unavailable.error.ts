import { DomainError } from './domain.error.js';

export class ServiceUnavailableError extends DomainError {
	readonly code = 'SERVICE_UNAVAILABLE';
	constructor(message: string) {
		super(message);
	}
}
