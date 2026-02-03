// src/modules/content/people/types/person.interface.ts
import { IPersonIndividual } from './individual.interface.js';
import { IPersonOrganization } from './organization.interface.js';

export interface IPersonBase {
	id: string; // uuidv7
	type: 'individual' | 'organization';
	details: IPersonIndividual | IPersonOrganization;
}
