// src/v3/security/security.controller.ts

import {
	Controller,
	Post,
	Body,
	Headers,
	Ip,
	InternalServerErrorException,
	UseInterceptors,
} from '@nestjs/common';
import { AuthenticationFlowService } from './authentication-flow/authentication-flow.service';

// DTOs
import { LoginDto } from './dto/login.dto';
import { VerifyMFADto } from './dto/verify-mfa.dto';
import { ThrottlerInterceptor } from './interceptors/throttler/throttler.interceptor';

// api3.mcitys.com/security
@Controller('security')
export class SecurityController {
	constructor(
		private readonly _authenticationFlowService: AuthenticationFlowService,
	) {}

	// ---------------------------------------------------------------------
	// POST /security/login
	// ---------------------------------------------------------------------
	@UseInterceptors(ThrottlerInterceptor)
	@Post('login')
	async login(
		@Body() body: LoginDto, // Contains username, password, recaptchaToken)
		@Ip() ipAddress: string,
		@Headers('user-agent') userAgent: string,
	) {
		// 1. Extracting IP address
		if (!ipAddress) {
			throw new InternalServerErrorException('Unable to determine IP address.');
		}

		// 2. Calling the authentication flow service
		const result = await this._authenticationFlowService.initiateLogin(
			body.username,
			body.password,
			body.recaptchaToken,
			ipAddress,
			userAgent,
		);

		// 3. Responding with the result
		return result;
	}

	// ---------------------------------------------------------------------
	// POST /security/mfa/send
	// ---------------------------------------------------------------------
	@UseInterceptors(ThrottlerInterceptor)
	@Post('mfa/send')
	async sendMfaCode(
		@Body('authSessionToken') authSessionToken: string,
		@Ip() ipAddress: string,
		@Headers('user-agent') userAgent: string,
	) {
		return this._authenticationFlowService.sendMFACode(
			authSessionToken,
			ipAddress,
			userAgent,
		);
	}

	// ---------------------------------------------------------------------
	// POST /security/mfa/verify
	// ---------------------------------------------------------------------
	@UseInterceptors(ThrottlerInterceptor)
	@Post('mfa/verify')
	async verifyMfaCode(
		@Body() body: VerifyMFADto,
		@Ip() ipAddress: string,
		@Headers('user-agent') userAgent: string,
	) {
		return this._authenticationFlowService.verifyMfaCode(
			body.authSessionToken,
			body.otpCode,
			ipAddress,
			userAgent,
		);
	}
}
