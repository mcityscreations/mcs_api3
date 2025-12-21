// src/security/roles/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../interfaces/roles.interface';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {} // Injecter le Reflector

	canActivate(context: ExecutionContext): boolean {
		// 1. Reading required roles from metadata
		const requiredRoles = this.reflector.get<UserRole[]>(
			ROLES_KEY,
			context.getHandler(),
		);

		if (!requiredRoles) {
			// If the road hasn't any Roles decorator, allow access
			return true;
		}

		// 2. Retrieving the user from the payload attached to the request by JWT guards
		const request: Request = context.switchToHttp().getRequest();

		// The JWT payload is stored in request.user
		const user = request.user;

		if (!user) {
			// If the payload is missing, security check failed. Reject access
			return false;
		}

		// 3. If it passed the above verifications, check if the user has one of the required roles
		return requiredRoles.some((role) => user.role === role);
	}
}
