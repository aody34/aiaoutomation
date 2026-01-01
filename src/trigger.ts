/**
 * Manual trigger script - Run this to immediately send a report
 * Usage: npm run trigger
 */

import { runDailyAnalysis } from './index';
import { validateConfig } from './config';

async function trigger(): Promise<void> {
    console.log('🚀 Manual trigger activated\n');

    if (!validateConfig()) {
        console.error('❌ Configuration validation failed.');
        console.log('\nMake sure your .env file is set up correctly.');
        process.exit(1);
    }

    try {
        await runDailyAnalysis();
        console.log('\n✅ Manual trigger complete!');
    } catch (error) {
        console.error('\n❌ Trigger failed:', error);
        process.exit(1);
    }
}

trigger();
