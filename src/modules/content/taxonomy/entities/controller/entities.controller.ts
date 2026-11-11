import { Controller } from '@nestjs/common';
import { EntitiesService } from '../services/entities.service.js';
import type { LanguageQueryDto } from '../../../../../common/dtos/language.dto.js';
import { Get, Query } from '@nestjs/common';

@Controller('taxonomy/entities')
export class EntitiesController {
	constructor(private readonly entitiesService: EntitiesService) {}

	@Get()
	public async findAll(@Query() query: LanguageQueryDto) {
		const lang = query.lang ?? null;
		return lang
			? this.entitiesService.findAllI18n(lang)
			: this.entitiesService.findAll();
	}
}
