import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * @description
 * This DTO is used to validate the query parameter for i18n in controllers.
 * It ensures that the i18n parameter is optional and, if provided, must be a boolean value.
 * The Transform decorator is used to convert the string 'true' or 'false' to a boolean value.
 */
export class IsI18nQueryDto {
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === 'true' || value === true)
	i18n?: boolean;
}
