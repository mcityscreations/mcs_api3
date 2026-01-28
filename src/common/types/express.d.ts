// src/common/types/express.d.ts

import { ITokenPayload } from '../../security/jwt/jwt.service.js';

// Type augmentation  of Express Request object
declare global {
	namespace Express {
		interface Request {
			user?: ITokenPayload; // Param 'user' optional if OptionalAuthGuard is used
		}
	}
}
