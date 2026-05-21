import { createZodDto } from 'nestjs-zod';
import { DateFilterSchema } from './datefilter.schema.js';

export class DateFilterDto extends createZodDto(DateFilterSchema) {}
