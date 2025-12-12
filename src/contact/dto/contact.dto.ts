// src/communicator/dto/contact.dto.ts

import {
	IsArray,
	IsNotEmpty,
	IsString,
	MaxLength,
	IsEmail,
	IsPhoneNumber,
	IsOptional,
} from 'class-validator';

export class BaseMessageDto {
	@IsArray()
	@IsNotEmpty()
	destinations: string[];

	@IsString()
	@IsNotEmpty()
	text: string;

	// Optional subject for SMS
	@IsOptional()
	@IsString()
	subject?: string;
}

export class SendEmailDto extends BaseMessageDto {
	@IsEmail({}, { each: true })
	declare destinations: string[];

	@IsNotEmpty({ message: 'Le sujet est obligatoire pour un e-mail.' })
	@MaxLength(255)
	declare subject: string;
}

export class SendSmsDto extends BaseMessageDto {
	@IsPhoneNumber(undefined, { each: true })
	declare destinations: string[];

	@MaxLength(160)
	declare text: string;
}
