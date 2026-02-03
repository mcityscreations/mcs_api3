// src/modules/content/taxonomy/keywords/dtos/create-keyword.dto.ts
import { createZodDto } from 'nestjs-zod';
import { CreateKeywordSchema } from '../schemas/keywords.schemas.js';

export class CreateKeywordDto extends createZodDto(CreateKeywordSchema) {}
