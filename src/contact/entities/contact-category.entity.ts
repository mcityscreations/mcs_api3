// src/contact/entities/contact-category-index.entity.ts (Entité Correcte)

import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { PersonContactEntity } from './person-contact.entity'; // Assurez-vous d'importer le contact

@Entity('mcs_people_contact_category_index')
export class ContactCategoryEntity {
	@PrimaryColumn({ length: 25, name: 'id_contact_category' })
	id: string; // Ex: 'EMAIL', 'PHONE', 'ADDRESS'

	@Column({ length: 250, name: 'title' })
	title: string; // Ex: 'Email', 'Phone', 'Address'

	// 💡 Relation inverse : Une catégorie peut avoir plusieurs entrées de contact
	@OneToMany(() => PersonContactEntity, (contact) => contact.category)
	contacts: PersonContactEntity[];
}
