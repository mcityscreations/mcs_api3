// src/modules/content/taxonomy/categories/dto/read-category.dto.ts
import { createZodDto } from 'nestjs-zod';
import { PublicReadCategorySchema } from '../schemas/category.schemas.js';

export class ReadCategoryDto extends createZodDto(PublicReadCategorySchema) {}
