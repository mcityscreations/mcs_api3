// src/common/dates/datesService.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
	/**
	 *
	 * @param date
	 * @returns Returns date in the following format "15-10-2025 10:00:00"
	 */
	public standardDateFormater(date: Date) {
		// 1. Retrieving date components
		const day = date.getDate();
		const month = date.getMonth() + 1; // January is 0
		const year = date.getFullYear();
		const hour = date.getHours();
		const minute = date.getMinutes();

		// 2. Adding a zero in order to always have a value with two digits (padding)
		// (ex: 5 becomes 05)
		const pad = (nombre: any) => String(nombre).padStart(2, '0');

		// 3. Assembling date components in the following format : "JJ.MM.AAAA HH.MM"
		const formattedDate = `${pad(day)}.${pad(month)}.${year} ${pad(hour)}.${pad(minute)}`;

		return formattedDate;
	}
	/**
	 * @description Returns a date in the following format
	 * YYYY-MM-DD HH:MM:SS
	 * */
	public mysqlDateFormatter(date: Date) {
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');

		// YYYY-MM-DD HH:MM:SS
		return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`;
	}
}
