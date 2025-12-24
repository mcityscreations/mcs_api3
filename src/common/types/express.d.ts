// src/common/types/express.d.ts

import { ITokenPayload } from 'src/security/jwt/jwt.service';

// Type augmentation  of Express Request object
declare global {
	namespace Express {
		interface Request {
			user?: ITokenPayload; // Param 'user' optional if OptionalAuthGuard is used
		}
	}
}
