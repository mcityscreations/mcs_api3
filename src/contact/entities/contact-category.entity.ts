// src/contact/entities/contact-category-index.entity.ts

import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { PersonContact } from './person-contact.entity'; // Assurez-vous d'importer le contact

@Entity('mcs_people_contact_category_index')
export class ContactCategory {
	@PrimaryColumn({ type: 'smallint', name: 'id_contact_category' })
	id: number;

	@Column({ type: 'character varying', length: 50, name: 'title' })
	title: string; // Ex: 'Email', 'Phone', 'Address'

	@OneToMany(() => PersonContact, (contact) => contact.category)
	contacts: PersonContact[];
}
