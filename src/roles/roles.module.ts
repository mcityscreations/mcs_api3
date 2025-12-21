// src/roles/roles.module.ts
import { Module } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
	providers: [
		RolesGuard,
		{
			provide: APP_GUARD, // Registering the RolesGuard as a global guard
			useClass: RolesGuard,
		},
	],
})
export class RolesModule {}
