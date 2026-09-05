// src/system/errors/map.error.ts
import { HttpStatus } from '@nestjs/common';
import { DomainError } from './domain.error.js';
import {
	NotFoundError,
	ValidationError,
	InternalError,
	BadRequestError,
	ConflictError,
} from './index.js';

export const DOMAIN_ERROR_HTTP_MAP = new Map<
	new (...args: any[]) => DomainError,
	number
>([
	[NotFoundError, HttpStatus.NOT_FOUND],
	[ValidationError, HttpStatus.BAD_REQUEST],
	[InternalError, HttpStatus.INTERNAL_SERVER_ERROR],
	[BadRequestError, HttpStatus.BAD_REQUEST],
	[ConflictError, HttpStatus.CONFLICT],
]);
