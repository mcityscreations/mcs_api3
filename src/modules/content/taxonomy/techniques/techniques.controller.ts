// src/modules/content/taxonomy/techniques/techniques.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { LanguageQueryDto } from '../../../../common/dtos/language.dto.js';
import { TechniquesService } from './techniques.service.js';
@Controller('taxonomy/techniques')
export class TechniquesController {
	constructor(private readonly techniquesService: TechniquesService) {}

	@Get()
	findAll(@Query() query: LanguageQueryDto) {
		const lang = query.lang ?? null;
		return lang
			? this.techniquesService.findAlli18n(lang)
			: this.techniquesService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string, @Query() query: LanguageQueryDto) {
		const lang = query.lang ?? null;
		return lang
			? this.techniquesService.findOnei18n(id, lang)
			: this.techniquesService.findOne(id);
	}
}
