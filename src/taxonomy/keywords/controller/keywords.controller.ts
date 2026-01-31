import { Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ThrottlerInterceptor } from '../../../security/interceptors/throttler/throttler.interceptor.js';
import { MandatoryAuthGuard } from '../../../security/guards/mandatory-auth/mandatory-auth.guard.js';

@Controller('keywords')
export class KeywordsController {
	@ApiOperation({ summary: 'Create a new keyword' })
	@ApiOkResponse({ description: 'Keyword created successfully' })
	@UseGuards(MandatoryAuthGuard)
	@UseInterceptors(ThrottlerInterceptor)
	@Post()
	createKeyword() {
		// Logic to create a new keyword
	}
}
