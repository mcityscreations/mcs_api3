// src/taxonomy/categories/dto/update-category.dto.ts
import { createZodDto } from 'nestjs-zod';
import { UpdateCategorySchema } from '../schemas/category.schemas.js';

export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {}