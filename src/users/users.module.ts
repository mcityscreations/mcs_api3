// src/users/users.module.ts

import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ContactModule } from '../contact/contact.module';
import { UserRepository } from './repository/user.repository';

@Module({
	imports: [ContactModule],
	controllers: [UsersController],
	providers: [UsersService, UserRepository],
	exports: [UsersService],
})
export class UsersModule {}
