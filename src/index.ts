import TelegramBot from 'node-telegram-bot-api';
import { config, validateConfig } from './config';
import { generateAIAgentIdeas } from './analysis/aiAgentGenerator';
import { sendAIAgentIdeas, sendMessage, sendError, initTelegramBot } from './notifications/telegram';
import { startScheduler } from './scheduler';

let isProcessing = false;

/**
 * Run the AI agent idea generation
 */
export async function runDailyAnalysis(): Promise<void> {
    if (isProcessing) {
        console.log('⏳ Already processing, please wait...');
        return;
    }

    isProcessing = true;
    console.log('🤖 Starting AI Agent Idea Generation...\n');

    try {
        console.log('Step 1/2: Generating AI agent ideas...');
        const ideas = await generateAIAgentIdeas(config.analysis.minIdeas);
        console.log(`  ✓ Generated ${ideas.length} AI agent ideas with build prompts`);

        console.log('\nStep 2/2: Sending to Telegram...');
        await sendAIAgentIdeas(ideas);
        console.log('  ✓ Ideas sent successfully!\n');

        console.log('✅ AI agent ideas complete!');
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        try {
            await sendError(error instanceof Error ? error.message : String(error));
        } catch (e) {
            // Ignore
        }
        throw error;
    } finally {
        isProcessing = false;
    }
}

/**
 * Start the interactive Telegram bot
 */
function startInteractiveBot(): void {
    const bot = new TelegramBot(config.telegram.botToken, { polling: true });

    console.log('📱 Interactive bot started - listening for commands...\n');
    console.log('Commands:');
    console.log('  • "hello" or "/start" - Get AI agent ideas');
    console.log('  • "/ideas" - Get AI agent ideas');
    console.log('  • "/help" - Show available commands\n');

    // Handle /start and hello
    bot.onText(/^(\/start|hello|hi|hey)$/i, async (msg) => {
        const chatId = msg.chat.id;

        if (chatId.toString() !== config.telegram.chatId) {
            console.log(`⚠️ Unauthorized access attempt from chat ${chatId}`);
            return;
        }

        console.log(`📨 Received "${msg.text}" from ${msg.from?.username || 'unknown'}`);

        try {
            await bot.sendMessage(chatId, '🤖 *Generating AI Agent Ideas...*\n\nPlease wait, this takes about 30 seconds.', { parse_mode: 'Markdown' });
            await runDailyAnalysis();
        } catch (error) {
            console.error('Error processing command:', error);
            await bot.sendMessage(chatId, '❌ Error generating ideas. Please try again.');
        }
    });

    // Handle /ideas command
    bot.onText(/^\/ideas$/i, async (msg) => {
        const chatId = msg.chat.id;

        if (chatId.toString() !== config.telegram.chatId) return;

        console.log(`📨 Received /ideas command from ${msg.from?.username || 'unknown'}`);

        try {
            await bot.sendMessage(chatId, '🤖 *Generating AI Agent Ideas...*\n\nPlease wait, this takes about 30 seconds.', { parse_mode: 'Markdown' });
            await runDailyAnalysis();
        } catch (error) {
            console.error('Error processing command:', error);
            await bot.sendMessage(chatId, '❌ Error generating ideas. Please try again.');
        }
    });

    // Handle /help command
    bot.onText(/^\/help$/i, async (msg) => {
        const chatId = msg.chat.id;

        if (chatId.toString() !== config.telegram.chatId) return;

        const helpMessage = `
🤖 *AI Agent Ideas Bot*

*Available Commands:*
• \`hello\` or \`/start\` - Generate new AI agent ideas
• \`/ideas\` - Generate new AI agent ideas
• \`/help\` - Show this help message

*Automatic Schedule:*
Daily at 9:00 AM (${config.schedule.timezone})

*What You Get:*
6+ AI agent website ideas with full build prompts for memecoin trading tools.
`;
        await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    });

    // Handle errors
    bot.on('polling_error', (error) => {
        console.error('Polling error:', error.message);
    });
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║       🤖 AI AGENT IDEAS FOR MEMECOIN TRADERS 🤖         ║
║                                                          ║
║  Commands: hello, /start, /ideas, /help                 ║
║  Schedule: Daily at 9:00 AM                             ║
╚══════════════════════════════════════════════════════════╝
`);

    if (!validateConfig()) {
        console.error('\n❌ Configuration validation failed.\n');
        process.exit(1);
    }

    console.log('✅ Configuration validated\n');

    // Check if running in trigger mode
    const args = process.argv.slice(2);
    if (args.includes('--trigger') || args.includes('-t')) {
        console.log('Running in trigger mode...\n');
        await runDailyAnalysis();
        process.exit(0);
    }

    // Start interactive bot (listens for hello, /start, /ideas)
    startInteractiveBot();

    // Start scheduled mode (daily at 9 AM)
    startScheduler();

    // Send startup notification
    try {
        await sendMessage('🤖 *AI Agent Ideas Bot is Online!*\n\nSend me `hello` or `/ideas` to get AI agent website ideas!\n\n_Also runs automatically every day at 9 AM_');
    } catch (error) {
        console.warn('⚠️ Could not send startup notification.');
    }

    // Keep alive
    process.on('SIGINT', () => {
        console.log('\n👋 Shutting down...');
        process.exit(0);
    });
}

if (require.main === module) {
    main().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
