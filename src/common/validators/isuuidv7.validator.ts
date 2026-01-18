// src/common/decorators/isuuidv7.decorator.ts
import { registerDecorator, ValidationOptions } from 'class-validator';

export function isUuidV7(value: any): boolean {
	const uuidV7Regex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return typeof value === 'string' && uuidV7Regex.test(value);
}

export function IsUuidV7(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: any) {
					return isUuidV7(value); // On réutilise la fonction ici
				},
				defaultMessage() {
					return `${propertyName} must be a valid UUID v7`;
				},
			},
		});
	};
}
