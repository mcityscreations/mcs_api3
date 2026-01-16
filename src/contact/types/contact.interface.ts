export interface IContact {
	idContact: number;
	idContactPublic: string;
	idPerson: number;
	idPersonPublic: string;
	contactCategory: { id: number; name: string };
	isPrimary: boolean;
	isProfessional: boolean;
	title: string | null;
	value: string;
	isVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
}
