import {
	ConflictException,
	ForbiddenException,
	Injectable,
	Inject,
	InternalServerErrorException,
	UnauthorizedException,
} from '@nestjs/common';
import { LoginService } from '../login/login.service';
import { RateLimiterService } from '../rate-limiter/rate-limiter.service';
import { RecaptchaService } from '../recaptcha/recaptcha.service';
import { MfaSessionService } from '../mfa/mfa.service';
import { IJWTResponse } from '../security.interfaces';
import { getErrorMessage } from '../../common/types/error.types';
import { WINSTON_LOGGER } from '../../system/logger/logger-factory/winston-logger.factory';
import { Logger } from 'winston';

export interface IMFAChallengeResponse {
	status: string;
	challengeType: string;
	authSessionToken: string;
	message: string;
}

@Injectable()
export class AuthenticationFlowService {
	constructor(
		private readonly _loginService: LoginService, // Main authentication and JWT issuance
		private readonly _rateLimiterService: RateLimiterService, // Applies limits to IP addresses
		private readonly _recaptchaService: RecaptchaService, // reCAPTCHA risk evaluation
		private readonly _mfaSessionService: MfaSessionService, // MFA session handler (Redis)
		@Inject(WINSTON_LOGGER) private readonly _winstonLogger: Logger, // Winston logger instance
	) {}

	// Login hanling with reCAPTCHA, Rate Limiting, and MFA
	public async initiateLogin(
		username: string,
		password: string,
		recaptchaToken: string,
		ipAddress: string,
		userAgent: string,
	): Promise<IJWTResponse> {
		// --- 1. IP checking (Rate Limit) ---
		await this._rateLimiterService.checkIpBlocked(ipAddress);

		// --- 2. Risk evaluation (reCAPTCHA) ---
		const recaptchaScore = await this._recaptchaService.createAssessment(
			recaptchaToken,
			'LOGIN',
		);
		const evaluationResult =
			this._recaptchaService.assessRiskFromRecaptchaScore(recaptchaScore);

		// --- 3. Security actions ---
		if (!evaluationResult.isAllowed) {
			// A. BLOCK (Low reCAPTCHA score)
			if (evaluationResult.requiredAction === 'BLOCK') {
				await this._rateLimiterService.recordFailure(ipAddress);
				this._winstonLogger.warn(`Login failure: User blocked by reCAPTCHA.`, {
					reason: 'BLOCKED_BY_RECAPTCHA',
					username: username,
					ipAddress: ipAddress,
					userAgent: userAgent,
				});
				throw new ForbiddenException('Utilisateur ou mot de passe erronés.'); // Response recommended by Google
			}
		}

		// --- 4. Checking credentials (password) ---
		// Returns user info if valid or null
		const authResult = await this._loginService.authenticateUser(
			username,
			password,
		);

		if (!authResult) {
			// Log et Rate Limit if invalid credentials
			await this._rateLimiterService.recordFailure(ipAddress);
			this._winstonLogger.warn(`Login failure`, {
				reason: 'Invalid credentials',
				username: username,
				ipAddress: ipAddress,
				userAgent: userAgent,
			});
			throw new UnauthorizedException('Identifiants invalides.');
		}

		// --- 5. Final decisin / MFA handling ---

		const isMfaRequired = evaluationResult.requiredAction === 'MFA_REQUIRED';

		if (isMfaRequired) {
			// A. MFA Required
			const authSessionToken = await this._mfaSessionService.createSession(
				username,
				authResult.role,
			); // Start a login session for MFA

			this._winstonLogger.info(`Login success: MFA required for user.`, {
				// The status of the login process
				status: 'MFA_REQUIRED',

				// Audit data
				username: username,
				ipAddress: ipAddress,
				userAgent: userAgent,

				// Auth session token for security audit
				authSessionToken: authSessionToken,
			});

			throw new UnauthorizedException({
				status: 'CHALLENGE_REQUIRED',
				challengeType: 'MFA',
				authSessionToken: authSessionToken,
				message: 'Vérification de sécurité supplémentaire requise.',
			});
		} else {
			// B. Final success (No MFA required or high reCAPTCHA score)
			const finalResponse: IJWTResponse = this._loginService.generateFinalToken(
				username,
				authResult.role,
			);

			this._winstonLogger.info(`Login success: User authenticated.`, {
				// The status of the login process
				status: 'SUCCESS',
				// Audit data
				username: username,
				ipAddress: ipAddress,
				userAgent: userAgent,
			});

			return finalResponse;
		}
	}

	/**
	 * Handles the MFA code sending request.
	 * @param authSessionToken The MFA session token.
	 * @returns A success message.
	 */
	public async sendMFACode(
		authSessionToken: string,
		ipAddress: string,
		userAgent: string,
	): Promise<{ message: string }> {
		// 1. Retrieving the MFA session from Redis
		const sessionData =
			await this._mfaSessionService.getSession(authSessionToken);

		if (!sessionData) {
			// Invalid, expired or unknown session
			this._winstonLogger.warn(
				`MFA code send failure: Invalid or expired MFA session.`,
				{
					reason: 'INVALID_OR_EXPIRED_MFA_SESSION',
					authSessionToken: authSessionToken,
					ipAddress: ipAddress,
					userAgent: userAgent,
				},
			);
			throw new UnauthorizedException(
				'Session MFA invalide ou expirée. Veuillez vous reconnecter.',
			);
		}
		// 2. Checking if MFA was already validated (to prevent reusing the same token)
		if (sessionData.mfa_validated) {
			throw new ConflictException('Session MFA déjà complétée.');
		}
		try {
			await this._mfaSessionService.triggerOtpSend(
				authSessionToken,
				sessionData,
			);
		} catch (error) {
			this._winstonLogger.error(
				`MFA code send failure: Error sending OTP code.`,
				{
					reason: 'OTP_SEND_ERROR',
					authSessionToken: authSessionToken,
					ipAddress: ipAddress,
					userAgent: userAgent,
					error: getErrorMessage(error),
				},
			);
			const errorMessage = getErrorMessage(error);
			this._winstonLogger.error(
				`Error while sending OTP to ${sessionData.username}: ${errorMessage}`,
			);
			throw new InternalServerErrorException(
				"Échec de l'envoi du code OTP. Veuillez réessayer.",
			);
		}
		this._winstonLogger.info(`MFA code sent successfully.`, {
			authSessionToken: authSessionToken,
			username: sessionData.username,
			ipAddress: ipAddress,
			userAgent: userAgent,
		});

		return { message: 'Code OTP envoyé avec succès.' };
	}

	/**
	 * Handles the OTP code verification
	 */
	public async verifyMfaCode(
		authSessionToken: string,
		otpCode: string,
		ipAddress: string,
		userAgent: string,
	): Promise<IJWTResponse> {
		// Returns the final JWT response if successful

		// 1. Retrieve Redis MFA Session
		const sessionData =
			await this._mfaSessionService.getSession(authSessionToken);

		if (!sessionData) {
			// Logging failure
			this._winstonLogger.warn(
				`MFA verification failure: Invalid or expired MFA session.`,
				{
					reason: 'INVALID_OR_EXPIRED_MFA_SESSION',
					authSessionToken: authSessionToken,
					ipAddress: ipAddress,
					userAgent: userAgent,
				},
			);

			throw new UnauthorizedException(
				'Invalid MFA Session. Please login again.',
			);
		}

		// 2. Checking the OTP code
		// We use the username stored in the session and the code provided by the user
		const verifiedSessionData = await this._mfaSessionService.verifyOtpCode(
			authSessionToken,
			otpCode,
		);

		if (!verifiedSessionData) {
			// Applying rate limiting on failed MFA attempts
			await this._rateLimiterService.recordFailure(ipAddress);
			// Logging failure
			this._winstonLogger.warn(`MFA verification failure: Invalid OTP code.`, {
				reason: 'INVALID_OTP_CODE',
				authSessionToken: authSessionToken,
				ipAddress: ipAddress,
				userAgent: userAgent,
				username: sessionData.username,
			});
			throw new UnauthorizedException('Code OTP invalide.');
		}

		// 3. Success

		// A. Deleting the MFA session to prevent reuse
		await this._mfaSessionService.deleteSession(authSessionToken);

		// B. Logging success
		this._winstonLogger.info(`MFA verification success: OTP code verified.`, {
			authSessionToken: authSessionToken,
			username: sessionData.username,
			ipAddress: ipAddress,
			userAgent: userAgent,
		});

		// C. Generating the final JWT token
		const finalResponse = this._loginService.generateFinalToken(
			sessionData.username,
			sessionData.role,
		);

		return finalResponse;
	}
}
