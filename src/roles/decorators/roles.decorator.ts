// src/security/roles/roles.decorator.ts
/**
 * @description Decorator to specify required user roles for route handlers.
 * Let us write @Roles(UserRole.ADMIN) instead of @SetMetadata('roles', [UserRole.ADMIN])
 */
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../interfaces/roles.interface';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
