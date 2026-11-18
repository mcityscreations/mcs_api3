import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ITokenPayload } from '../../modules/security/jwt/jwt.service.js';

export const GetUser = createParamDecorator(
	(data: string | undefined, ctx: ExecutionContext) => {
		const request: Request = ctx.switchToHttp().getRequest();
		const user: ITokenPayload = request.user as ITokenPayload;

		// If we request a specific property (e.g., @GetUser('username'))
		return data ? (user?.[data as keyof ITokenPayload] as unknown) : user;
	},
);
