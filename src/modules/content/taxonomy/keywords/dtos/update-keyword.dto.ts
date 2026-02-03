// src/modules/content/taxonomy/keywords/dtos/update-keyword.dto.ts
import { createZodDto } from 'nestjs-zod';
import { UpdateKeywordSchema } from '../schemas/keywords.schemas.js';

export class UpdateKeywordDto extends createZodDto(UpdateKeywordSchema) {}
