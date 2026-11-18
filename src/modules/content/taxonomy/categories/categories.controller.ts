// src/modules/content/taxonomy/categories/categories.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { GetParamsCategoryDto } from './dto/get-params-category.dto.js';
import { UuidDto } from '../../../../common/dtos/uuid.dto.js';

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
	findAll(@Query() query: GetParamsCategoryDto) {
		const lang = query.lang ?? null;
		const entityId = query.entityId ?? null;
		return lang
			? this.categoriesService.findAlli18n(lang, entityId)
			: this.categoriesService.findAll(entityId);
	}

	@Get(':id')
	findOne(@Param() params: UuidDto, @Query() query: GetParamsCategoryDto) {
		const lang = query.lang ?? null;
		return lang
			? this.categoriesService.findOnei18n(params.id, lang)
			: this.categoriesService.findOne(params.id);
	}
}
