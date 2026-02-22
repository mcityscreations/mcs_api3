import { IsNotEmpty, IsString, Length, IsNumberString } from 'class-validator';

export class VerifyMFADto {
	@IsNotEmpty()
	@IsString()
	authSessionToken: string;

	@IsNotEmpty()
	@IsString()
	@Length(6, 6, { message: 'The OTP code must be 6 digits long.' })
	@IsNumberString({}, { message: 'The OTP code must contain only digits.' })
	otpCode: string;
}
