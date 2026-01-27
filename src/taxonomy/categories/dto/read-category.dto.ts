// src/taxonomy/categories/dto/read-category.dto.ts
import { createZodDto } from 'nestjs-zod';
import { ReadCategorySchema } from '../schemas/category.schemas.js';

export class ReadCategoryDto extends createZodDto(ReadCategorySchema) {}