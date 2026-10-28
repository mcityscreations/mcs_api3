import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
	public async addPayment(payload: IAddPayment): Promise<string | null> {}
}
