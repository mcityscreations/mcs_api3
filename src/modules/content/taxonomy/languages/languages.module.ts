import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service.js';
import { LanguagesRepository } from './languages.repository.js';

@Module({
	providers: [LanguagesService, LanguagesRepository],
	exports: [LanguagesService],
})
export class LanguagesModule {}
