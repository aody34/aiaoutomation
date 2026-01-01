import cron from 'node-cron';
import { config } from './config';
import { runDailyAnalysis } from './index';

/**
 * Start the scheduled automation
 */
export function startScheduler(): void {
    const cronExpression = config.schedule.cron;

    console.log(`⏰ Starting scheduler with cron: ${cronExpression}`);
    console.log(`   Timezone: ${config.schedule.timezone}`);

    // Validate cron expression
    if (!cron.validate(cronExpression)) {
        console.error('❌ Invalid cron expression:', cronExpression);
        process.exit(1);
    }

    // Schedule the job
    cron.schedule(
        cronExpression,
        async () => {
            console.log(`\n${'='.repeat(50)}`);
            console.log(`🚀 Running scheduled analysis at ${new Date().toISOString()}`);
            console.log(`${'='.repeat(50)}\n`);

            try {
                await runDailyAnalysis();
            } catch (error) {
                console.error('❌ Scheduled job failed:', error);
            }
        },
        {
            timezone: config.schedule.timezone,
        }
    );

    console.log('✅ Scheduler started successfully');
    console.log('   Next run will be according to your cron schedule');
    console.log('   Press Ctrl+C to stop\n');
}

/**
 * Get next scheduled run time (approximate)
 */
export function getNextRunTime(): Date {
    // Simple approximation - just show current schedule info
    const now = new Date();
    console.log(`Current time: ${now.toISOString()}`);
    console.log(`Schedule: ${config.schedule.cron}`);
    return now;
}
