import {
	Injectable,
	UnauthorizedException,
	BadRequestException,
} from '@nestjs/common';
import { Buffer } from 'buffer';

// Standard utilities
import { promisify } from 'util';

// Security and cryptography
import { scrypt as scryptAsync, timingSafeEqual } from 'crypto';
import { JwtService } from '../jwt/jwt.service';
import { IJWTResponse } from '../security.interfaces';

// User scripts
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../roles/interfaces/roles.interface';
import { isUserRole } from '../../roles/helpers/roles.helpers';

// Logging and error handling
import { getErrorMessage } from '../../common/types/error.types';
import { WinstonLoggerService } from '../../system/logger/logger-service/winston-logger.service';

/** LOGIN SERVICE */

// Converting scrypt to return a Promise
const scrypt = promisify(scryptAsync) as (
	password: string | Buffer,
	salt: string | Buffer,
	keylen: number,
) => Promise<Buffer>;

@Injectable()
export class LoginService {
	constructor(
		private readonly _jwtService: JwtService,
		private readonly _usersService: UsersService,
		private readonly _winstonLogger: WinstonLoggerService,
	) {}

	public async authenticateUser(
		username: string,
		password: string,
	): Promise<{ username: string; role: UserRole } | null> {
		// Validating inputs
		if (
			!username ||
			!password ||
			username.trim() === '' ||
			password.trim() === ''
		) {
			throw new BadRequestException(
				"Le nom d'utilisateur et le mot de passe doivent être fournis.",
			);
		}

		try {
			// 1. Get user by username
			const user = await this._usersService.getUserByUsername(username);

			if (!user) {
				throw new UnauthorizedException(
					"Nom d'utilisateur ou mot de passe invalide.",
				);
			}

			// 2. Account active check
			if (!user.isAccountActive) {
				throw new UnauthorizedException(
					'Votre compte a été désactivé. Veuillez contacter votre webmaster.',
				);
			}

			// 3. Get stored password and salt
			const credentials =
				await this._usersService.getUserPasswordByUsername(username);

			if (
				!credentials ||
				!credentials.passwordHash ||
				!credentials.passwordSalt
			) {
				// Account without password
				throw new UnauthorizedException(
					"Nom d'utilisateur ou mot de passe invalide.",
				);
			}

			// 4. Password check (scrypt)
			const derivedKey: Buffer = await scrypt(
				password,
				credentials.passwordSalt,
				64,
			);
			const storedKey = Buffer.from(credentials.passwordHash, 'hex');

			// Secure comparison (timingSafeEqual)
			const isMatch = timingSafeEqual(derivedKey, storedKey);

			if (!isMatch) {
				throw new UnauthorizedException(
					"Nom d'utilisateur ou mot de passe invalide.",
				);
			}

			// 5. Success
			const userRole = user.role.title as UserRole;
			const isValidRole = isUserRole(userRole);

			if (!isValidRole) {
				this._winstonLogger.error(
					`Rôle invalide récupéré pour l'utilisateur : ${username}. ID rôle : ${user.role.id}`,
				);
				throw new UnauthorizedException('Rôle utilisateur invalide.');
			}

			// Return identification data for token generation
			return {
				username: user.username,
				role: userRole,
			};
		} catch (error: any) {
			// Log general errors, let specific errors (Unauthorized) be handled by Nest
			if (!(error instanceof UnauthorizedException)) {
				const errorMessage = getErrorMessage(error);
				this._winstonLogger.error(
					`Critical error during authentication of ${username}: ${errorMessage}`,
				);
			}
			// Propagate the error
			throw error;
		}
	}

	public generateFinalToken(
		username: string,
		privilege: UserRole,
	): IJWTResponse {
		// Checking params
		if (!username || username === '')
			throw new BadRequestException(
				'A username must be provided to generate a JWT token',
			);
		if (!privilege)
			throw new BadRequestException(
				'User privilege must be provided to generate a JWT token',
			);
		const isValidRole = isUserRole(privilege);
		if (!isValidRole) {
			throw new BadRequestException(
				'Invalid user privilege provided for JWT token generation',
			);
		}
		// Generating token
		const token = this._jwtService.createToken({
			username: username,
			role: privilege,
		});
		return {
			username: username,
			role: privilege,
			jwt_token: token.token,
		};
	}
}
