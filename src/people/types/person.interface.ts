// src/people/types/person.interface.ts
import { IPersonIndividual } from './individual.interface';
import { IPersonOrganization } from './organization.interface';

export interface IPersonBase {
	id: string; // uuidv7
	type: 'individual' | 'organization';
	details: IPersonIndividual | IPersonOrganization;
}
