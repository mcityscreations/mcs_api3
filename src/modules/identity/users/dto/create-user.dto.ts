// src/users/dto/create-user.dto.ts (Nouveau fichier)

import {
	IsIn,
	IsString,
	IsNotEmpty,
	IsEmail,
	MinLength,
	MaxLength,
} from 'class-validator';

const ACCEPTED_CATEGORIES = ['PART', 'ASSO', 'ENTR'];

export class CreateUserDto {
	@IsString()
	@IsNotEmpty({
		message:
			'La catégorie de la personne est obligatoire (PART, ENTR, ASSO, etc.).',
	})
	@IsIn(ACCEPTED_CATEGORIES, {
		message:
			"Catégorie non reconnue. Veuillez utiliser l'une des suivantes : PART, ENTR, ASSO.",
	})
	idCategory: string; // Ex: 'PART', 'ENTR', 'ASSO'

	// --- Informations Personnelles (mcs_people_individual_detail) ---
	// Note : Ces champs ne seront utilisés que si idCategory est 'PART'
	@IsString()
	@IsNotEmpty({ message: 'Le nom de famille est obligatoire.' })
	@MaxLength(50)
	lastName: string;

	@IsString()
	@IsNotEmpty({ message: 'Le prénom est obligatoire.' })
	@MaxLength(50)
	firstName: string;

	@IsString()
	@IsNotEmpty({ message: "Le nom d'utilisateur est obligatoire." })
	@MaxLength(80)
	username: string;

	// --- Information de Contact (mcs_people_contact_index) ---
	@IsEmail({}, { message: "L'adresse e-mail n'est pas valide." })
	@IsNotEmpty({ message: "L'adresse e-mail est obligatoire." })
	email: string;

	// --- Sécurité (users_index) ---
	@IsString()
	@IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
	@MinLength(8, {
		message: 'Le mot de passe doit contenir au moins 8 caractères.',
	})
	@MaxLength(50)
	password: string;

	// 💡 Note : Les champs 'salt', 'idPerson', 'accountActive' seront gérés
	// par le UsersService et ne sont pas inclus dans le DTO d'entrée.
}
