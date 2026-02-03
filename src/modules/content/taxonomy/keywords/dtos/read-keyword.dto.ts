// src/modules/content/taxonomy/keywords/dtos/read-keyword.dto.ts
import { createZodDto } from 'nestjs-zod';
import { ReadKeywordSchema } from '../schemas/keywords.schemas.js';

export class ReadKeywordDto extends createZodDto(ReadKeywordSchema) {}
