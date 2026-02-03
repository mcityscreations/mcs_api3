export interface IUser {
	idPublic: string;
	username: string;
	idPerson: string;
	isAccountActive: boolean;
	role: {
		id: number;
		title: string;
	};
	createdAt: Date;
	updatedAt: Date;
}
