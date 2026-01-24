import { PartialType } from '@nestjs/mapped-types';
import { CreateTechniqueDto } from './create-technique.dto.js';

export class UpdateTechniqueDto extends PartialType(CreateTechniqueDto) {}
