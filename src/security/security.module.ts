// src/security/security.module.ts
import { Module } from '@nestjs/common';
import { SystemModule } from 'src/system/system.module';
import { SecurityController } from './security.controller';
import { AuthenticationFlowService } from './authentication-flow/authentication-flow.service';
import { JwtService } from './jwt/jwt.service';
import { JwtRepository } from './jwt/jwt.repository';
import { DatabaseModule } from '../database/database.module';
import { LoginService } from './login/login.service';
import { MfaSessionService } from './mfa/mfa.service';
import { MfaSessionRepository } from './mfa/mfa.repository';
import { OtpService } from './otp/otp.service';
import { RateLimiterService } from './rate-limiter/rate-limiter.service';
import { RateLimiterRepository } from './rate-limiter/rate-limiter.repository';
import { RecaptchaService } from './recaptcha/recaptcha.service';
import { RecaptchaConfigService } from './recaptcha/recaptcha-config/recaptcha-config.service';

@Module({
	imports: [SystemModule, DatabaseModule],
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
	],
})
export class SecurityModule {}
