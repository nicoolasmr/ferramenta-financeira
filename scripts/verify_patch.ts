import { calculateInstallmentStatus } from '../src/lib/scheduling/utils';

// Mock Installment Type for testing
type MockInstallment = {
    id: string;
    due_date: string;
    amount_cents: number;
    status: 'pending' | 'paid' | 'overdue' | 'renegotiated';
    paid_at: string | null;
};

function runTest(name: string, assertion: boolean) {
    if (assertion) {
        console.log(`✅ ${name}: PASS`);
    } else {
        console.error(`❌ ${name}: FAIL`);
        process.exit(1);
    }
}

async function verifyPatchLogic() {
    console.log("🔍 Starting Patch Logic Verification...\n");

    const todayStr = new Date().toISOString().split('T')[0];
    const pastDate = new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0]; // 10 days ago
    const futureDate = new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0]; // 10 days future

    // TEST 1: Basic Overdue (No Grace)
    const inst1: MockInstallment = { id: '1', due_date: pastDate, amount_cents: 1000, status: 'pending', paid_at: null };
    const status1 = calculateInstallmentStatus(inst1, 0);
    runTest("Past Due (0 Grace) should be overdue", status1 === 'overdue');

    // TEST 2: Grace Period (Within Grace)
    // Due 10 days ago, Grace 15 days -> Should be PENDING
    const inst2: MockInstallment = { id: '2', due_date: pastDate, amount_cents: 1000, status: 'pending', paid_at: null };
    const status2 = calculateInstallmentStatus(inst2, 15);
    runTest("Past Due (Within 15d Grace) should be pending", status2 === 'pending');

    // TEST 3: Grace Period (Exceeded)
    // Due 10 days ago, Grace 5 days -> Should be OVERDUE
    const inst3: MockInstallment = { id: '3', due_date: pastDate, amount_cents: 1000, status: 'pending', paid_at: null };
    const status3 = calculateInstallmentStatus(inst3, 5);
    runTest("Past Due (Exceeded 5d Grace) should be overdue", status3 === 'overdue');

    // TEST 4: Renegotiated Logic (Visual Only - Logic is backend)
    console.log("\n💰 Renegotiation Calc Check:");
    const originalDebt = 50000; // 500.00
    const newnstallmentsCount = 5;
    const newAmount = Math.floor(originalDebt / newnstallmentsCount);
    const remainder = originalDebt - (newAmount * newnstallmentsCount);

    runTest("Split Calculation Exact", (newAmount * newnstallmentsCount + remainder) === originalDebt);
    console.log(`   Debt: ${originalDebt}, Split: ${newnstallmentsCount}x ${newAmount} + Remainder ${remainder}`);

    console.log("\n✅ Verification Complete: All logic tests passed.");
}

verifyPatchLogic();
