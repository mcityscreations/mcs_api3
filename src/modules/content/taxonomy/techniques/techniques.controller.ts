import { Controller, Get, Param, Query } from '@nestjs/common';
import { LanguageQueryDto } from '../../../../common/dtos/language.dto.js';
import { UuidDto } from '../../../../common/dtos/uuid.dto.js';
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
	findOne(@Param() params: UuidDto, @Query() query: LanguageQueryDto) {
		const lang = query.lang ?? null;
		return lang
			? this.techniquesService.findOnei18n(params.id, lang)
			: this.techniquesService.findOne(params.id);
	}
}
