// src/modules/security/security.module.ts
import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller.js';
import { AuthenticationFlowService } from './authentication-flow/authentication-flow.service.js';
import { JwtService } from './jwt/jwt.service.js';
import { JwtRepository } from './jwt/jwt.repository.js';
import { DatabaseModule } from '../../system/database/database.module.js';
import { LoginService } from './login/login.service.js';
import { MfaSessionService } from './mfa/mfa.service.js';
import { MfaSessionRepository } from './mfa/mfa.repository.js';
import { OtpService } from './otp/otp.service.js';
import { RateLimiterService } from './rate-limiter/rate-limiter.service.js';
import { RateLimiterRepository } from './rate-limiter/rate-limiter.repository.js';
import { RecaptchaService } from './recaptcha/recaptcha.service.js';
import { RecaptchaConfigService } from './recaptcha/recaptcha-config/recaptcha-config.service.js';
// Related modules
import { UsersModule } from '../identity/users/users.module.js';
import { ContactModule } from '../content/contact/contact.module.js';

@Module({
	imports: [DatabaseModule, UsersModule, ContactModule],
	controllers: [SecurityController],
	providers: [
		AuthenticationFlowService,
		JwtService,
		JwtRepository,
		LoginService,
		MfaSessionService,
		MfaSessionRepository,
		OtpService,
		RateLimiterService,
		RateLimiterRepository,
		RecaptchaService,
		RecaptchaConfigService,
		{
			provide: 'RECAPTCHA_CONFIG_TOKEN',
			useFactory: (configService: RecaptchaConfigService) => {
				if (!configService) {
					console.error(
						'Le service de config est introuvable dans la factory !',
					);
				}
				return configService.getRecaptchaConfig();
			},
			inject: [RecaptchaConfigService],
		},
	],
	exports: [ JwtService, JwtRepository],
})
export class SecurityModule {}
