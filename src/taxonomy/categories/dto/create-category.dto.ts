// src/taxonomy/categories/dto/create-category.dto.ts
import { createZodDto } from 'nestjs-zod';
import { CreateCategorySchema } from '../schemas/category.schemas.js';

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}
