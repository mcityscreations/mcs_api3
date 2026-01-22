// src/system/metrics/metrics.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { register } from 'prom-client';

@Controller('metrics')
export class MetricsController {
	/**
	 * This route will be called by the Prometheus server (e.g., every 15s).
	 * It exposes the counters that the LoggingInterceptor updates.
	 */
	@Get()
	async getMetrics(@Res() res: Response) {
		// Set the content type to the one expected by Prometheus
		res.set('Content-Type', register.contentType);

		// Return all metrics accumulated in the global registry
		res.end(await register.metrics());
	}
}
