import cron, { ScheduledTask } from 'node-cron';
import { calculateNext30DaysCron } from '../utils/next30DaysCron';


interface CronJobDetail {
    job: ScheduledTask;
    nextRun?: Date;
}

class CronManager {
    private static instance: CronManager;
    private jobs: Record<string, CronJobDetail>;

    private constructor() {
        this.jobs = {}; // Initialize the jobs dictionary
    }

    // Ensure only one instance of CronManager is created (singleton pattern)
    public static getInstance(): CronManager {
        if (!CronManager.instance) {
            CronManager.instance = new CronManager();
        }
        return CronManager.instance;
    }

    /**
     * Schedule a new cron job.
     * @param name - Unique identifier for the cron job.
     * @param schedule .
     * @param task - Function to execute.
     * @param start - Whether to start the job immediately (default: true).
     */
    public addJob(
        name: string,
        schedule: string,
        task: () => void,
        start: boolean = true,
        every30Days: boolean = false,
        startDate: Date = new Date()
    ): void {
        if (this.jobs[name]) {
            throw new Error(`Cron job with name "${name}" already exists.`);
        }

        let nextRun: Date | undefined = undefined;

        // Use the helper function to calculate the cron schedule
        schedule = calculateNext30DaysCron(startDate);
        nextRun = new Date(startDate);
        nextRun.setDate(nextRun.getDate() + 30);
        const job = cron.schedule(schedule, task, { scheduled: start });
        this.jobs[name] = { job, nextRun };
    }

    /**
     * Get a cron job by its name.
     * @param name - Name of the job.
     * @returns The job object or null if not found.
     */
    public getJob(name: string): ScheduledTask | null {
        return this.jobs[name]?.job || null;
    }

    /**
     * Stop a cron job.
     * @param name - Name of the job to stop.
     */
    public stopJob(name: string): void {
        const job = this.getJob(name);
        if (!job) {
            throw new Error(`No cron job found with name "${name}".`);
        }
        job.stop();
    }

    /**
     * Start a cron job.
     * @param name - Name of the job to start.
     */
    public startJob(name: string): void {
        const job = this.getJob(name);
        if (!job) {
            throw new Error(`No cron job found with name "${name}".`);
        }
        job.start();
    }

    /**
     * Remove a cron job.
     * @param name - Name of the job to remove.
     */
    public removeJob(name: string): void {
        const job = this.getJob(name);
        if (!job) {
            throw new Error(`No cron job found with name "${name}".`);
        }
        job.stop();
        delete this.jobs[name];
    }

    /**
     * List all scheduled cron jobs.
     * @returns A list of job names.
     */
    public listJobs(): { name: string; nextRun: Date | undefined }[] {
        return Object.entries(this.jobs).map(([name, details]) => ({
            name,
            nextRun: details.nextRun,
        }));
    }
}

export default CronManager.getInstance();