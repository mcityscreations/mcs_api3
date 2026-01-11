// src/people/entities/person-detail.entity.ts

import {
	Entity,
	PrimaryColumn,
	Column,
	OneToOne,
	BaseEntity,
	JoinColumn,
} from 'typeorm';
import { Person } from './person.entity';

@Entity('mcs_people_individual_detail')
export class PersonDetail extends BaseEntity {
	/**
	 * Primary key and Foreign Key to Person.
	 */
	@PrimaryColumn({ name: 'id_person', length: 25 })
	idPerson: string;

	/**
	 * Relation One-to-One towards Person entity.
	 * This relation is the "owner" side of the relation (has the JoinColumn).
	 */
	@OneToOne(() => Person, (person) => person.details)
	@JoinColumn({ name: 'id_person', referencedColumnName: 'idPerson' })
	person: Person;

	// --- Specific Details ---
	@Column({ name: 'firstname', type: 'character varying', length: 50 })
	firstName: string;

	@Column({ name: 'lastname', type: 'character varying', length: 50 })
	lastName: string;

	@Column({
		name: 'created_at',
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP',
	})
	createdAt: Date;
}
