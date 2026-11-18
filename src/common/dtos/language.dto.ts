import { createZodDto } from 'nestjs-zod';
import { LanguageQuerySchema } from '../schemas/query-language.schema.js';

export class LanguageQueryDto extends createZodDto(LanguageQuerySchema) {}
