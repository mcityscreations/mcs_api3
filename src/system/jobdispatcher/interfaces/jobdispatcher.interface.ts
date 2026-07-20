import type { IJobOptions } from '../schemas/job-option.schema.js';
import type { IBulkJob } from '../schemas/bulk-job.schema.js';

export abstract class JobDispatcher {
	/**@description Dispatch a job to the specified queue */
	abstract dispatch<T>(
		queueName: string,
		jobName: string,
		payload: T,
		options?: IJobOptions,
	): Promise<void> | void;

	/**@description Dispatch multiple jobs to the specified queue */
	abstract dispatchBulk(queueName: string, jobs: IBulkJob[]): Promise<void>;

	/**@description Schedule a job to run based on a cron expression */
	abstract schedule<T>(
		queueName: string,
		jobName: string,
		payload: T,
		cronExpression: string, // ex: '0 2 * * *' (everyday at 2h)
		options?: { jobId?: string }, // A unique ID to avoid duplicating the cron on restart
	): Promise<void>;

	abstract cancel(queueName: string, jobId: string): Promise<boolean>; // Retourne true si le job a bien été supprimé
}
