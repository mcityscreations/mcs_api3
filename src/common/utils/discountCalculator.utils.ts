import { ValidationError } from '../../system/errors/index.js';
/**
 * @description Calculates the price after applying a discount percentage to the original price.
 * The discount percentage is expected to be in PBS (per ten thousand), and the price is in cents.
 * If the discount percentage is greater than 0, it calculates the discount amount and subtracts it from the original price.
 * If the discount percentage is 0 or less, it returns the original price.
 * @param discountPercentage // Percentage in PBS
 * @param priceExcl // Price in cents
 * @returns price after discount in cents
 */
export const discountCalculator = (
	discountPercentage: number,
	priceExcl: number,
): number => {
	if (!discountPercentage || !priceExcl) {
		throw new ValidationError(
			'Discount percentage and price excluding tax must be provided.',
		);
	}
	if (discountPercentage > 0) {
		const discountAmount = Math.round((priceExcl * discountPercentage) / 10000);
		const unitPriceAfterDiscount = priceExcl - discountAmount;
		return unitPriceAfterDiscount;
	}
	return priceExcl;
};
