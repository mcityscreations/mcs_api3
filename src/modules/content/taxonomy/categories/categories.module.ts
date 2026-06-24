// src/modules/content/taxonomy/categories/categories.module.ts
import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { CategoriesController } from './categories.controller.js';
import { CategoriesRepository } from './categories.repository.js';

@Module({
	controllers: [CategoriesController],
	providers: [CategoriesService, CategoriesRepository],
})
export class CategoriesModule {}
