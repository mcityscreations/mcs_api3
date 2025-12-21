// src/roles/entities/role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('users_roles_index')
export class Role {
	/**
	 * Role ID (Primary Key)
	 */
	@PrimaryGeneratedColumn({ name: 'id_role' })
	id: number; //

	/**
	 * Role title
	 */
	@Column({ name: 'title', length: 150, unique: true })
	title: string; // ADMIN, ARTIST, PROVIDER, VISITOR

	/**
	 * Relation OneToMany towards User entity.
	 * One role can be assigned to many users.
	 */
	@OneToMany(() => User, (user) => user.role)
	users: User[];
}
