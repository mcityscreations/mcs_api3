// src/modules/content/taxonomy/keywords/controller/keywords.controller.ts
import {
	Controller,
	Post,
	UseGuards,
	UseInterceptors,
	Get,
	Query,
	Param,
} from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ThrottlerInterceptor } from '../../../../security/interceptors/throttler/throttler.interceptor.js';
import { MandatoryAuthGuard } from '../../../../security/guards/mandatory-auth/mandatory-auth.guard.js';
import { KeywordsService } from '../service/keywords.service.js';
import { LanguageQueryDto } from '../../../../../common/dtos/language.dto.js';
import { UuidDto } from '../../../../../common/dtos/uuid.dto.js';

@Controller('taxonomy/keywords')
export class KeywordsController {
	constructor(private readonly keywordsService: KeywordsService) {}

	@ApiOperation({ summary: 'Create a new keyword' })
	@ApiOkResponse({ description: 'Keyword created successfully' })
	@UseGuards(MandatoryAuthGuard)
	@UseInterceptors(ThrottlerInterceptor)
	@Post()
	createKeyword() {
		// Logic to create a new keyword
	}

	@Get(':id')
	async findOne(@Param() params: UuidDto, @Query() query: LanguageQueryDto) {
		const lang = query.lang ?? null;
		return lang
			? this.keywordsService.findOnei18n(params.id, lang)
			: this.keywordsService.findOne(params.id);
	}

	@Get()
	async findAll(@Query() query: LanguageQueryDto) {
		const lang = query.lang ?? null;
		return lang
			? this.keywordsService.findAlli18n(lang)
			: this.keywordsService.findAll();
	}
}
