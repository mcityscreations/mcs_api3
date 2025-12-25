// src/security/otp/otp.service.ts
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { ContactService } from '../../contact/contact.service';
import { IOTPPayload } from '../security.interfaces';
import { UsersService } from '../../users/users.service';

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
		const otpCode = Math.floor(Math.random() * 1000000)
			.toString()
			.padStart(6, '0');

		// Calculating expiry time
		const now = new Date();
		const expiresAt = new Date(now.getTime() + OTP_TTL_SECONDS * 60 * 1000);

		return { username: username, otp: otpCode, expiresAt: expiresAt.getTime() };
	}

	public async sendMFACode(otpPayload: IOTPPayload): Promise<void> {
		// Retrieving user's phone number
		const phoneNumber: string | null =
			await this._usersService.getPhoneNumberByUsername(otpPayload.username);

		if (!phoneNumber) {
			throw new ForbiddenException('Invalid request or user configuration.');
		}

		// Sending message
		const message = `MCITYS - Your security code is: ${otpPayload.otp}. It expires in ${OTP_TTL_SECONDS / 60} minutes.`;
		await this._contactService.sendSMS({
			destinations: [phoneNumber],
			text: message,
		});
	}
}
