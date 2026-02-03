// src/modules/content/people/types/organization.interface.ts

export interface IPersonOrganization {
	type: 'organization';
	legalName: string;
	category: {
		id: string;
		name: string;
	};
	registrationCountry: {
		id: string;
		name: string;
	};
	idRegistration: string;
	idVAT: string;
}
