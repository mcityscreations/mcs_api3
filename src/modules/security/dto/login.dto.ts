import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
	@IsNotEmpty({ message: 'A username and a password must be provided.' })
	@IsString({ message: 'Wrong username or password.' })
	@MinLength(3, { message: 'Wrong username or password.' })
	@MaxLength(50, { message: 'Wrong username or password.' })
	username: string;

	@IsNotEmpty({ message: 'A username and a password must be provided.' })
	@IsString({ message: 'Wrong username or password.' })
	@MinLength(8, { message: 'Wrong username or password.' })
	@MaxLength(100, { message: 'Wrong username or password.' })
	password: string;

	@IsNotEmpty()
	@IsString()
	@MaxLength(2500, { message: 'reCAPTCHA token is too long.' })
	recaptchaToken: string;
}
