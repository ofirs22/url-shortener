/**
 * Calculates the next cron expression based on a 30-day interval from a start date.
 * @param startDate - The starting date for the 30-day interval.
 * @returns A cron expression string (e.g., '0 12 1 2 *').
 */
export function calculateNext30DaysCron(startDate: Date): string {
    const nextRun = new Date(startDate);
    nextRun.setDate(nextRun.getDate() + 30);
    const minute = nextRun.getMinutes();
    const hour = nextRun.getHours();
    const day = nextRun.getDate();
    const month = nextRun.getMonth() + 1; // Cron months are 1-indexed
    return `${minute} ${hour} ${day} ${month} *`;
}