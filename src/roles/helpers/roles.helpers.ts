// src/security/roles/roles.helpers.ts
import { UserRole } from '../interfaces/roles.interface';

// Valid user roles
const VALID_USER_ROLES: UserRole[] = ['ADMIN', 'ARTIST', 'PROVIDER', 'VISITOR'];

/**
 * Type Guard that checks if a given value is a valid UserRole.
 * @param role The value to be checked
 * @returns {role is UserRole} Returns a boolean.
 */
export function isUserRole(role: any): role is UserRole {
	// 1. Checks if the value is a string
	if (typeof role !== 'string') {
		return false;
	}
	// 2. Checks if the string is one of the valid roles
	return VALID_USER_ROLES.includes(role as UserRole);
}
