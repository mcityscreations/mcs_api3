import { ConfigService } from "@nestjs/config";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface.js";

export const corsFactory = (configService: ConfigService): CorsOptions => {
    const parseEnvList = (key: string) => {
        const value = configService.get<string>(key);
        return value && value.length > 0 
            ? value.split(',').map(item => item.trim()) 
            : undefined;
    };

    const origin = parseEnvList('CORS_ORIGIN');
    const methods = parseEnvList('CORS_METHODS');
    const allowedHeaders = parseEnvList('CORS_ALLOWED_HEADERS');
    
    const rawCredentials = configService.get<string>('CORS_CREDENTIALS');
    const credentials = rawCredentials ? rawCredentials.toLowerCase() === 'true' : false;

    return {
        // If origin is undefined, set it to false to block all for security
        origin: origin ?? false, 
        methods,
        allowedHeaders,
        credentials,
        exposedHeaders: parseEnvList('CORS_EXPOSED_HEADERS'), // For JWT
    };
}