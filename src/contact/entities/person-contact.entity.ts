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
import { ContactCategoryEntity } from './contact-category.entity';

@Entity('mcs_people_contact_index')
export class PersonContactEntity extends BaseEntity {
	@PrimaryGeneratedColumn('increment', { name: 'id_contact_index' })
	id: number;

	// --- Relations (Foreign Keys) ---

	// Relation to Person
	@Column({ name: 'id_person', length: 25 })
	idPerson: string;

	@ManyToOne(() => Person, (person) => person.contacts)
	@JoinColumn({ name: 'id_person' })
	person: Person;

	// Relation to ContactCategoryEntity (EMAIL, PHONE, etc.)
	@Column({ name: 'id_contact_category', length: 25 })
	idContactCategory: string;

	@ManyToOne(() => ContactCategoryEntity, (category) => category.id)
	@JoinColumn({ name: 'id_contact_category' })
	category: ContactCategoryEntity;

	// --- Data Columns ---

	@Column({ name: 'is_primary', type: 'tinyint' })
	isPrimary: boolean;

	@Column({ name: 'is_professional', type: 'tinyint' })
	isProfessional: boolean;

	@Column({ name: 'title', length: 250 })
	title: string;

	@Column({ name: 'value', length: 250 })
	value: string; // e.g., email address or phone number

	@Column({ name: 'is_verified', type: 'tinyint' })
	isVerified: boolean;

	// --- Dates ---

	@CreateDateColumn({ name: 'creation_date', type: 'datetime' })
	creationDate: Date;

	@UpdateDateColumn({ name: 'last_update', type: 'datetime' })
	lastUpdate: Date;
}
