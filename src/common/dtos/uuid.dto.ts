import { createZodDto } from 'nestjs-zod';
import { UuidSchema } from '../schemas/ids.schema.js';

export class UuidDto extends createZodDto(UuidSchema) {}
