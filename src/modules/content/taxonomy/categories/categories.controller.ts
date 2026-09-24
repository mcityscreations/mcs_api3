// src/modules/content/taxonomy/categories/categories.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { LanguageQueryDto } from '../../../../common/dtos/language.dto.js';

@Controller('taxonomy/categories')
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	/*
	@Post()
	create(@Body() createCategoryDto: CreateCategoryDto) {
		return this.categoriesService.create(createCategoryDto);
	}
*/
	@Get()
	findAll(@Query() query: LanguageQueryDto) {
		const lang = query.lang ?? null;
		return lang
			? this.categoriesService.findAlli18n(lang)
			: this.categoriesService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string, @Query() query: LanguageQueryDto) {
		const lang = query.lang ?? null;
		return lang
			? this.categoriesService.findOnei18n(id, lang)
			: this.categoriesService.findOne(id);
	}
}
