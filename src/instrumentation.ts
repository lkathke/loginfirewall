export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { cleanupExpiredIPs } = await import('./lib/ip-whitelist');
        const cron = await import('node-cron');

        // Run cleanup every hour
        cron.schedule('0 * * * *', async () => {
            console.log('Running IP whitelist cleanup...');
            await cleanupExpiredIPs();
        });

        console.log('IP Cleanup Cron Job registered');
    }
}
