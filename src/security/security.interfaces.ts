// src/security/security.interfaces.ts
import { UserRole } from '../roles/interfaces/roles.interface';

export interface ISecurityEvaluationResult {
	/** If set to true, proceed */
	isAllowed: boolean;

	/** * Required action if isAllowed is false.
	 * Ex: 'NONE', 'BLOCK', 'MFA_REQUIRED', 'CAPTCHA_REQUIRED'
	 */
	requiredAction: 'NONE' | 'BLOCK' | 'MFA_REQUIRED' | 'CHALLENGE_REQUIRED';
}

export interface IOTPPayload {
	username: string;
	otp: string; // Converted to string to preserve leading zeros
	expiresAt: number; // Date/time of expiration (timestamp)
}

// Interface for the values stored in the MFA session (Redis)
export interface IMfaSessionData {
	username: string;
	role: UserRole;
	mfa_validated: boolean;
	createdAt: number; // Timestamp
	otpCode: string | undefined;
	otpExpiresAt: number;
}

export class LoginDTO {
	public username!: string;
	public password!: string;
	public recaptchaToken!: string;
}

export class VerifyMfaDto {
	public authSessionToken!: string; // MFA session token
	public otpCode!: string; // 6 digits OTP code
}

export class IJWTResponse {
	username: string;
	role: UserRole;
	jwt_token: string;
}
