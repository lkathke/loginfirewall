import 'dotenv/config';
import { ZoraxyService } from '../src/lib/zoraxy';

type Action = 'add' | 'remove';

function usage() {
    console.log('Usage: npx ts-node --transpile-only scripts/test-zoraxy.ts <add|remove> <whitelistId> <ip> [comment]');
    process.exit(1);
}

const [, , actionArg, whitelistId, ip, ...commentParts] = process.argv;
const action = actionArg as Action;

if (!action || (action !== 'add' && action !== 'remove') || !whitelistId || !ip) {
    usage();
}

const comment = commentParts.join(' ') || 'CLI Zoraxy test';

async function run() {
    try {
        console.log('Initial debug state:', ZoraxyService['debugState']?.());

        console.log(`Action: ${action}, whitelistId: ${whitelistId}, ip: ${ip}`);
        if (action === 'add') {
            const res = await ZoraxyService.addToWhitelist(whitelistId, ip, comment);
            console.log('Add response:', res);
        } else {
            const res = await ZoraxyService.removeFromWhitelist(whitelistId, ip);
            console.log('Remove response:', res);
        }

        console.log('Final debug state:', ZoraxyService['debugState']?.());
    } catch (err: any) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        console.error('Request failed', status ? `status=${status}` : '', data ? `data=${JSON.stringify(data)}` : '');
        console.error(err?.message || err);
        console.error('Debug state after error:', ZoraxyService['debugState']?.());
        process.exit(1);
    }
}

run();
