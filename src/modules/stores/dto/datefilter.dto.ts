import { createZodDto } from 'nestjs-zod'
import { DateFilterSchema } from '../schemas/datefilter.schema.js';

export class DateFilterDto extends createZodDto(DateFilterSchema) {}