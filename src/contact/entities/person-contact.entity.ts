// src/contact/entities/person-contact.entity.ts

import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	BaseEntity,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Person } from '../../people/entities/person.entity';
import { ContactCategory } from './contact-category.entity';

@Entity('content.contact')
export class PersonContact extends BaseEntity {
	// --- Primary Key ---

	@PrimaryGeneratedColumn('increment', { name: 'id_contact' })
	idContact: number;

	@Column({ name: 'id_public', type: 'uuid', unique: true, insert: false })
	idPublic: string;

	// --- Relations (Foreign Keys) ---

	// Relation to Person
	@Column({ name: 'id_person', type: 'bigint' })
	idPerson: number;

	@ManyToOne(() => Person, (person) => person.contacts)
	@JoinColumn({ name: 'id_person' })
	person: Person;

	// Relation to ContactCategoryEntity (EMAIL, PHONE, etc.)
	@Column({ name: 'id_contact_category', type: 'smallint' })
	idContactCategory: number;

	@ManyToOne(() => ContactCategory, (category) => category.id)
	@JoinColumn({ name: 'id_contact_category' })
	category: ContactCategory;

	// --- Data Columns ---

	@Column({ name: 'is_primary', type: 'boolean' })
	isPrimary: boolean;

	@Column({ name: 'is_professional', type: 'boolean' })
	isProfessional: boolean;

	@Column({ name: 'title', type: 'character varying', length: 50 })
	title: string;

	@Column({ name: 'value', type: 'character varying', length: 80 })
	value: string; // e.g., email address or phone number

	@Column({ name: 'is_verified', type: 'boolean' })
	isVerified: boolean;

	// --- Dates ---

	@CreateDateColumn({
		name: 'created_at',
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP',
	})
	createdAt: Date;

	@UpdateDateColumn({
		name: 'updated_at',
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP',
	})
	updatedAt: Date;
}
