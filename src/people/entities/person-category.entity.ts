// src/person/entities/person-category.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Person } from './person.entity';

@Entity('people_category')
export class PersonCategory {
	/**
	 * Primary Key
	 * (ex: 'PART', 'ENTR', 'ASSO')
	 */
	@PrimaryGeneratedColumn({ name: 'id_person_category', type: 'smallint' })
	idPersonCategory: number;

	@Column({ name: 'id_public', type: 'uuid', unique: true, insert: false })
	idPublic: string;

	/**
	 * Readable title of the category
	 */
	@Column({ name: 'title', length: 25 })
	title: string;

	@Column({
		name: 'created_at',
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP',
	})
	createdAt: Date;

	/**
	 * Inverse relation: List of people/entities associated with this category.
	 */
	@OneToMany(() => Person, (person) => person.category)
	people: Person[];
}
