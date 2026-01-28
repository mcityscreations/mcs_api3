// src/users/users.module.ts

import { Module } from '@nestjs/common';

import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { ContactModule } from '../contact/contact.module.js';
import { UserRepository } from './repository/user.repository.js';

@Module({
	imports: [ContactModule],
	controllers: [UsersController],
	providers: [UsersService, UserRepository],
	exports: [UsersService],
})
export class UsersModule {}
