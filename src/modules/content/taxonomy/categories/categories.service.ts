// src/modules/content/taxonomy/categories/categories.service.ts
import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { CategoriesRepository } from './categories.repository.js';

@Injectable()
export class CategoriesService {
	constructor(private readonly categoriesRepository: CategoriesRepository) {}
	create(createCategoryDto: CreateCategoryDto) {
		return 'This action adds a new category';
	}

	findAll() {
		return `This action returns all categories`;
	}

	findOne(id: number) {
		return `This action returns a #${id} category`;
	}

	update(id: number, updateCategoryDto: UpdateCategoryDto) {
		return `This action updates a #${id} category`;
	}

	remove(id: number) {
		return `This action removes a #${id} category`;
	}

	async findInternalIdByUuid(uuid: string): Promise<number | null> {
		return this.categoriesRepository.findInternalIdByUuid(uuid);
	}
}
