import {
	Injectable,
	Inject,
	InternalServerErrorException,
	UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
	sign as jwtSign,
	verify as jwtVerify,
	decode as jwtDecode,
	JwtPayload,
} from 'jsonwebtoken';
import { JwtRepository } from './jwt.repository';
import { UserRole } from 'src/roles/interfaces/roles.interface';
import {
	getErrorMessage,
	isErrorWithMessage,
} from '../../common/types/error.types';
import { WINSTON_LOGGER } from '../../system/logger/logger-factory/winston-logger.factory';
import { Logger } from 'winston';

export interface IJwtPayload {
	username: string;
	role: UserRole;
}

export interface ITokenPayload extends JwtPayload {
	username: string;
	role: UserRole;
	jti: string;
	exp: number;
}

@Injectable()
export class JwtService {
	private _JWT_PRIVATE_KEY: string;
	private _JWT_PUBLIC_KEY: string;

	constructor(
		private readonly _jwtRepository: JwtRepository,
		@Inject(WINSTON_LOGGER) private readonly _winstonLogger: Logger,
	) {
		// 1. Loading private JWT private key
		const PRIVATE_KEY_CONTENT = process.env.JWT_PRIVATE_KEY;
		if (!PRIVATE_KEY_CONTENT || PRIVATE_KEY_CONTENT === '') {
			throw new InternalServerErrorException(
				'JWT private key is not configured.',
			);
		}
		// Handling RS256 key formatting
		this._JWT_PRIVATE_KEY = PRIVATE_KEY_CONTENT.replace(/\\n/g, '\n');

		// 2. Loading public JWT public key
		const PUBLIC_KEY_CONTENT = process.env.JWT_PUBLIC_KEY;
		if (!PUBLIC_KEY_CONTENT || PUBLIC_KEY_CONTENT === '') {
			throw new InternalServerErrorException(
				'JWT public key is not configured.',
			);
		}
		this._JWT_PUBLIC_KEY = PUBLIC_KEY_CONTENT.replace(/\\n/g, '\n');
	}

	public createToken(payload: IJwtPayload): { token: string } {
		// 1. Validating configuration
		if (!this._JWT_PRIVATE_KEY || this._JWT_PRIVATE_KEY == '') {
			throw new InternalServerErrorException(
				'JWT private key is not configured',
			);
		}

		// 2. Validating payload
		if (!payload.username || payload.username === '') {
			throw new UnauthorizedException(
				'Unable to authenticate user: username is missing',
			);
		}
		if (!payload.role) {
			throw new UnauthorizedException(
				'Unable to authenticate user: role is missing',
			);
		}

		try {
			// 3. Synchronous token generation
			const jti = randomUUID();
			const token = (
				jwtSign as (
					payload: object | string | Buffer,
					secret: string | Buffer,
					options: object,
				) => string
			)(
				{ username: payload.username, role: payload.role, jti: jti },
				this._JWT_PRIVATE_KEY,
				{ algorithm: 'RS256', expiresIn: '1h' },
			);

			return { token: token };
		} catch (error) {
			// 4. Error handling
			this._winstonLogger.error('JWT token generation failed', {
				error: getErrorMessage(error),
			});
			throw new InternalServerErrorException(
				'An unexpected error occurred during token generation',
			);
		}
	}

	public async verifyToken(token: string): Promise<ITokenPayload | null> {
		let decodedToken;

		// Checking the secret key
		if (!this._JWT_PUBLIC_KEY || this._JWT_PUBLIC_KEY == '') {
			throw new InternalServerErrorException(
				'JWT private key is not configured',
			);
		}

		// Trying to decode the token
		try {
			const verificationResult = (
				jwtVerify as (
					token: string,
					secret: string | Buffer,
					options?: object,
				) => unknown
			)(token, this._JWT_PUBLIC_KEY);

			decodedToken = verificationResult as ITokenPayload;
		} catch (error: unknown) {
			// If verification fails (token has expired, wrong signature...)
			if (isErrorWithMessage(error)) {
				if (
					error.name === 'TokenExpiredError' ||
					error.name === 'JsonWebTokenError'
				) {
					this._winstonLogger.warn(`JWT verification failed: ${error.message}`);
					throw new UnauthorizedException('Invalid token');
				}
			}
			// Handle unexpected errors
			this._winstonLogger.error(
				'Unexpected error during JWT verification:',
				getErrorMessage(error),
			);
			throw new InternalServerErrorException(
				'An unexpected error occurred during token verification',
			);
		}

		// 1. Is decodedToken an object and not null ?
		if (typeof decodedToken !== 'object' || decodedToken === null) {
			throw new InternalServerErrorException(
				'Invalid token: unable to decode or missing payload.',
			);
		}

		// 2. Checking that jti is a property of decodedToken
		if (!('jti' in decodedToken)) {
			throw new InternalServerErrorException(
				'Invalid token: JTI claim is missing.',
			);
		}

		// 3. Strong typing with type assertion
		const tokenPayload = decodedToken as ITokenPayload;

		// 4. Checking that JTI is a string
		if (typeof tokenPayload.jti !== 'string') {
			throw new InternalServerErrorException(
				'Invalid token: JTI claim must be a string.',
			);
		}

		// 5. Secure check, jti is recognized as a property of tokenPayload.
		// Is the token revoked ?
		const isRevoked = await this._jwtRepository.hasJTI(tokenPayload.jti);
		if (isRevoked) {
			throw new UnauthorizedException('Token has been revoked');
		}

		return decodedToken as ITokenPayload;
	}

	public async revokeToken(token: string): Promise<void> {
		try {
			const decoded = (
				jwtDecode as unknown as (token: string) => ITokenPayload
			)(token);

			if (
				typeof decoded === 'object' &&
				decoded !== null &&
				decoded.jti &&
				decoded.exp
			) {
				// Calculating remaining time to live
				const now = Math.floor(Date.now() / 1000);
				const ttlSeconds = decoded.exp - now;

				if (ttlSeconds > 0) {
					// The JTI must be stored in Redis with a TTL equal to the remaining time of the token.
					await this._jwtRepository.addJTI(decoded.jti, ttlSeconds);
					return;
				}
			}
			// If the token is invalid or has no jti or is already expired, do nothing
		} catch (error) {
			// In case of error decoding or revoking, ignore the revocation to avoid crash.
			this._winstonLogger.error('Failed to decode or revoke token:', {
				error: getErrorMessage(error),
			});
		}
	}
}
