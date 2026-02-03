// src/system/security/otp/otp.service.ts
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { ContactService } from '../../../modules/content/contact/contact.service.js';
import { IOTPPayload } from '../security.interfaces.js';
import { UsersService } from '../../../modules/identity/users/users.service.js';

// TTL (Time To Live) for OTP in minutes
const OTP_TTL_SECONDS = 5 * 60; // 5 minutes

@Injectable()
export class OtpService {
	constructor(
		private readonly _usersService: UsersService,
		private readonly _contactService: ContactService,
	) {}

	public generateOTP(username: string): IOTPPayload {
		// Checking username
		if (!username || username === '') {
			throw new BadRequestException(
				'A username must be provided to generate an OTP',
			);
		}

		// Generate a 6-digit OTP
		// PadStart ensures leading zeros are included
		const otpCode = randomInt(0, 1000000).toString().padStart(6, '0');

		// Calculating expiry time
		const now = new Date();
		const expiresAt = new Date(now.getTime() + OTP_TTL_SECONDS * 1000); // 5 minutes from now

		return { username: username, otp: otpCode, expiresAt: expiresAt.getTime() };
	}

	public async sendMFACode(otpPayload: IOTPPayload): Promise<void> {
		// Retrieving user's person ID to communicate with the ContactService
		const personId = await this._usersService.getPersonIDByUsername(
			otpPayload.username,
		);
		if (!personId) {
			throw new ForbiddenException('Invalid request or user configuration.');
		}
		const message = `MCITYS - Your security code is: ${otpPayload.otp}. It expires in ${OTP_TTL_SECONDS / 60} minutes.`;
		await this._contactService.sendMessage(personId, {
			destinations: [],
			subject: 'Your MCITYS Security Code',
			text: message,
		});
	}
}
