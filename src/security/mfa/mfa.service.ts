import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { IMfaSessionData, IOTPPayload } from '../security.interfaces';
import { MfaSessionRepository } from './mfa.repository';
import { OtpService } from '../otp/otp.service';
import { WinstonLoggerService } from 'src/system/logger/logger-service/winston-logger.service';

@Injectable()
export class MfaSessionService {
	constructor(
		private readonly _MFArepository: MfaSessionRepository,
		private readonly _otpService: OtpService,
		private readonly _winstonLogger: WinstonLoggerService,
	) {}

	/** -- SESSIONS HANDLING -- */
	public async createSession(
		username: string,
		privilege: string,
	): Promise<string> {
		const token = randomUUID();
		const data = {
			username: username,
			privilege: privilege,
			mfa_validated: false,
			createdAt: Date.now(),
		};

		// Délégation du stockage au dépôt
		await this._MFArepository.save(token, data);

		return token;
	}

	/**
	 * Retrieves the data of an MFA session. Returns null if the token is invalid,
	 * expired (TTL elapsed), or if the data is corrupted.
	 */
	public async getSession(token: string): Promise<IMfaSessionData | null> {
		// Retrieving session data from Redis
		const dataString = await this._MFArepository.find(token);

		if (!dataString || dataString === '') {
			// Missing session, return null
			return null;
		}

		try {
			// Parsing JSON data
			const data = JSON.parse(dataString) as IMfaSessionData;

			// If empty Data Set, return null
			if (
				!data.username ||
				!data.role ||
				typeof data.mfa_validated === 'undefined'
			) {
				this._winstonLogger.error(
					`MfaSessionService: Invalid session data for the ${token}.`,
				);
				return null;
			}

			return data;
		} catch (error) {
			// Unable to parse JSON (Redis data is corrupted)
			const errorStack = error instanceof Error ? error.stack : '';
			this._winstonLogger.error(
				`MfaSessionService: Error while parsing the token ${token}.`,
				errorStack,
			);
			return null;
		}
	}

	/**
	 * Removing manually an MFA session
	 * Must be called after a successfull MFA validation to avoid reuse.
	 */
	public async deleteSession(token: string): Promise<void> {
		await this._MFArepository.delete(token);
	}

	/** -- OTP HANDLING -- */
	public async triggerOtpSend(
		authSessionToken: string,
		sessionData: IMfaSessionData,
	): Promise<void> {
		// Generating the OTP code
		const otpPayload: IOTPPayload = this._otpService.generateOTP(
			sessionData.username,
		);

		// Storing the OTP into Redis MFA Session
		sessionData.otpCode = otpPayload.otp;

		// Adding OTP TTL to MFA Session data object
		sessionData.otpExpiresAt = otpPayload.expiresAt;

		// Updating MFA Session Data in Redis
		await this._MFArepository.save(authSessionToken, sessionData);

		// Sending code by SMS
		await this._otpService.sendMFACode(otpPayload);
	}

	public async verifyOtpCode(
		sessionID: string,
		otpCode: string,
	): Promise<IMfaSessionData> {
		// 1. Loading & validating the session
		const mfaSession = await this.getSession(sessionID);

		if (!mfaSession || mfaSession.mfa_validated) {
			throw new UnauthorizedException('Session MFA invalide ou expirée.');
		}

		// 2. Checking if the token has expired
		if (mfaSession.otpExpiresAt && Date.now() > mfaSession.otpExpiresAt) {
			throw new UnauthorizedException('The OTP code expired.');
		}

		// 3. Checking value
		if (mfaSession.otpCode !== otpCode) {
			throw new UnauthorizedException('Invalid OTP code.');
		}

		// 4. Success: Mark the session as validated (+ remove OTP code)
		mfaSession.mfa_validated = true;
		mfaSession.otpCode = undefined; // Deleting OTP code to prevent reusing it

		// 5. Updating MFA Session status/data
		await this._MFArepository.save(sessionID, mfaSession);

		return mfaSession; // Returns the data of the validated session
	}
}
