// src/system/jobdispatcher/adapters/bullmq.adapter.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobDispatcher } from '../interfaces/jobdispatcher.interface.js';
import { WinstonLoggerService } from '../../logger/logger-service/winston-logger.service.js';
import type { IJobOptions } from '../schemas/job-option.schema.js';
import type { IBulkJob } from '../schemas/bulk-job.schema.js';

@Injectable()
export class BullMqAdapter extends JobDispatcher {
	// Dynamically cache queues to avoid querying ModuleRef for every message
	private queuesCache = new Map<string, Queue>();

	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly logger: WinstonLoggerService,
	) {
		super();
	}

	/**
	 * Retrieves the queue registered dynamically by any business module.
	 */
	private resolveQueue(queueName: string): Queue {
		let queue = this.queuesCache.get(queueName);

		if (!queue) {
			const queueToken = getQueueToken(queueName);
			queue = this.moduleRef.get<Queue>(queueToken, { strict: false });

			if (!queue) {
				throw new InternalServerErrorException(
					`The queue [${queueName}] has not been declared in any module.`,
				);
			}

			this.queuesCache.set(queueName, queue);
		}

		return queue;
	}

	public async dispatch<T>(
		queueName: string,
		jobName: string,
		payload: T,
		options?: IJobOptions,
	): Promise<void> {
		const queue = this.resolveQueue(queueName);

		await queue.add(jobName, payload, {
			attempts: options?.attempts || 3,
			backoff: options?.backoff || { type: 'exponential', delay: 5000 },
		});

		this.logger.log(
			`Job [${jobName}] successfully dispatched to the queue [${queueName}].`,
		);
	}

	public async dispatchBulk(
		queueName: string,
		jobs: IBulkJob[],
	): Promise<void> {
		const queue = this.resolveQueue(queueName);

		const bulkJobs = jobs.map(({ jobName, payload, options }) => ({
			name: jobName,
			data: payload,
			opts: {
				attempts: options?.attempts || 3,
				backoff: options?.backoff || { type: 'exponential', delay: 5000 },
			},
		}));

		await queue.addBulk(bulkJobs);
		this.logger.log(
			`${bulkJobs.length} jobs successfully dispatched in bulk to the queue [${queueName}].`,
		);
	}

	public async schedule<T>(
		queueName: string,
		jobName: string,
		payload: T,
		cronExpression: string,
		options?: { jobId?: string },
	): Promise<void> {
		const queue = this.resolveQueue(queueName);

		// If no ID is provided, we generate one based on the job name to avoid duplicates
		const schedulerId = options?.jobId || `scheduler:${jobName}`;

		await queue.upsertJobScheduler(
			schedulerId,
			{ pattern: cronExpression, tz: 'Europe/Paris' },
			{
				name: jobName,
				data: payload,
				opts: {
					attempts: 3,
					backoff: { type: 'exponential', delay: 5000 },
				},
			},
		);

		this.logger.log(
			`Scheduler [${schedulerId}] configured successfully (CRON: ${cronExpression}) in the queue [${queueName}].`,
		);
	}

	public async cancel(queueName: string, jobId: string): Promise<boolean> {
		const queue = this.resolveQueue(queueName);

		// 1. Strategy A: Try to remove the scheduler (if it was a CRON scheduled via schedule)
		// Removing directly the scheduler with the jobId (which is the schedulerId) if it exists
		const schedulerRemoved = await queue.removeJobScheduler(jobId);

		if (schedulerRemoved) {
			this.logger.log(
				`Scheduler with ID [${jobId}] removed from the queue [${queueName}].`,
			);
			return true;
		}

		// 2. Strategy B: If it wasn't a Scheduler, look for and remove a standard job
		const job = await queue.getJob(jobId);

		if (job) {
			await job.remove();
			this.logger.log(
				`Standard job with ID [${jobId}] removed from the queue [${queueName}].`,
			);
			return true;
		}

		this.logger.warn(
			`Unable to cancel: no scheduler or job found with ID [${jobId}] in the queue [${queueName}].`,
		);
		return false;
	}
}
