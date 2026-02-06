import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, Observable, map } from 'rxjs';

export interface IResponse<T> {
	success: boolean;
	statusCode: number;
	path: string;
	method: string;
	data: T;
	timestamp: string;
	version: string;
}

@Injectable()
export class SuccessInterceptor implements NestInterceptor {
	intercept<T = any>(
		context: ExecutionContext,
		next: CallHandler<T>,
	): Observable<IResponse<T>> {
		const request: Request = context.switchToHttp().getRequest();
		const response: Response = context.switchToHttp().getResponse();

		return next.handle().pipe(
			catchError((err) => {
				throw err;
			}),
			map((data: T) => ({
				success: true,
				statusCode: response.statusCode,
				path: request.url,
				method: request.method,
				data: data ?? ('N/A' as unknown as T),
				timestamp: new Date().toISOString(),
				version: 'v3',
			})),
		);
	}
}
