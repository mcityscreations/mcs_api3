// src/people/entities/person.entity.ts

import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToOne,
	ManyToOne,
	OneToMany,
	JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PersonCategory } from './person-category.entity';
import { PersonDetail } from './person-detail.entity';
import { PersonContact } from '../../contact/entities/person-contact.entity';

@Entity('content.people')
export class Person {
	// --- Primary Keys ---

	@PrimaryGeneratedColumn('identity', {
		name: 'id_person',
		generatedIdentity: 'ALWAYS',
	})
	idPerson: string;

	@Column({ name: 'id_public', type: 'uuid', unique: true, insert: false })
	idPublic: string;

	@Column({ name: 'reference', length: 50, unique: true })
	reference: string;

	// --- Types ---

	@Column({ name: 'id_person_category', type: 'smallint' })
	idPersonCategory: number;

	@Column({ name: 'is_company', type: 'boolean' })
	isCompany: boolean;

	// --- Timestamps ---

	@Column({
		name: 'created_at',
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP',
	})
	createdAt: Date;
	@Column({
		name: 'updated_at',
		type: 'timestamp',
		nullable: true,
		onUpdate: 'CURRENT_TIMESTAMP',
	})
	updatedAt: Date;

	// --- Relations ---

	// 1. Relation towards Category (ManyToOne)
	@ManyToOne(() => PersonCategory, (category) => category.people)
	@JoinColumn({ name: 'id_person_category' })
	category: PersonCategory;

	// 2. Relation towards Individual Details (OneToOne)
	// Contains the first name/last name, but only if isCompany is false
	@OneToOne(() => PersonDetail, (details) => details.person)
	details: PersonDetail;

	// 3. Relation towards User (OneToOne)
	/**
	 * Relation One-to-One inverse towards User entity.
	 * This relation is OPTIONAL: not all people have a User account.
	 * NOTE: TypeORM CANNOT create a foreign key constraint here.
	 * This is a purely logical link.
	 */
	@OneToOne(() => User, (user) => user.person)
	user: User;

	// 4. Relation towards Contacts (OneToMany)
	@OneToMany(() => PersonContact, (contact) => contact.person)
	contacts: PersonContact[];
}
