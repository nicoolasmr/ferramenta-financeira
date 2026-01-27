
import { getTeamMembers } from './src/actions/team/index.js';

async function test() {
    try {
        console.log('Testing getTeamMembers...');
        const members = await getTeamMembers('some-org-id'); // We need a real org ID from the DB
        console.log('Members:', members);
    } catch (error) {
        console.error('Error in test:', error);
    }
}

test();
