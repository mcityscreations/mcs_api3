import { createZodDto } from 'nestjs-zod';
import { CategoryQuerySchema } from '../schemas/category-query.schema.js';

export class GetParamsCategoryDto extends createZodDto(CategoryQuerySchema) {}
