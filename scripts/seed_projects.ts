
import { createClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'
import 'dotenv/config'

// Ensure we have env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// Note: In real seed script for admin tasks, we usually use SERVICE_ROLE_KEY.
// For now, assuming anon key with proper RLS or user login is not sufficient for massive writes 
// unless we bypass RLS or sign in. 
// Assuming this runs in a context where we can write. If RLS blocks, we need service role.
// Let's assume the user will provide SERVICE_ROLE_KEY in .env.local for this script locally, 
// or we use the printed format to run in SQL Editor.

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
    console.log('Starting seed...')

    // 1. Create Organization
    const orgId = faker.string.uuid() // In real app, we insert. Here generating ID for reference.
    const ownerId = faker.string.uuid()

    // Print SQL for manual execution as it's safer and avoids RLS/Auth complexity in script for now
    console.log(`
    -- INSERT ORGANIZATION
    INSERT INTO organizations (id, name, slug) VALUES 
    ('${orgId}', 'Acme Inc', 'acme-inc');

    -- INSERT USER (Link to existing Auth user if needed, here just mock)
    -- INSERT INTO users (id, email, full_name) VALUES ...
    
    -- INSERT MEMBERSHIP
    -- INSERT INTO memberships (org_id, user_id, role) VALUES ...

    -- INSERT CUSTOMERS
  `)

    // Generate Customers
    const customerIds = []
    for (let i = 0; i < 20; i++) {
        const id = faker.string.uuid()
        customerIds.push(id)
        console.log(`INSERT INTO customers (id, org_id, name, email) VALUES ('${id}', '${orgId}', '${faker.person.fullName().replace(/'/g, "''")}', '${faker.internet.email()}');`)
    }

    // 2. Create Project
    const projectId = faker.string.uuid()
    console.log(`
    -- INSERT PROJECT
    INSERT INTO projects (id, org_id, name, client_name) VALUES
    ('${projectId}', '${orgId}', 'Mentoria Q1 2026', 'Acme Partners');
  `)

    // 3. Create Enrollments & Plans
    for (const custId of customerIds) {
        const enrollmentId = faker.string.uuid()
        const planId = faker.string.uuid()

        const total = faker.helpers.arrayElement([500000, 1000000, 1500000]) // 5k, 10k, 15k
        const entry = faker.number.int({ min: 100000, max: 200000 })
        const installmentsCount = 5
        const installmentAmount = Math.floor((total - entry) / installmentsCount)

        console.log(`
        -- ENROLLMENT for ${custId}
        INSERT INTO enrollments (id, org_id, project_id, customer_id, status, cycle_month) 
        VALUES ('${enrollmentId}', '${orgId}', '${projectId}', '${custId}', 'active', 6);
        
        -- PLAN
        INSERT INTO payment_plans (id, org_id, enrollment_id, total_amount_cents, entry_amount_cents, installments_count)
        VALUES ('${planId}', '${orgId}', '${enrollmentId}', ${total}, ${entry}, ${installmentsCount});
      `)

        // Installments
        for (let j = 1; j <= installmentsCount; j++) {
            const due = faker.date.future().toISOString().split('T')[0]
            const status = faker.helpers.arrayElement(['pending', 'paid', 'overdue'])
            console.log(`
            INSERT INTO installments (org_id, plan_id, installment_number, amount_cents, due_date, status)
            VALUES ('${orgId}', '${planId}', ${j}, ${installmentAmount}, '${due}', '${status}');
          `)
        }
    }

    console.log('Seed SQL generated. Run this in your Supabase SQL Editor.')
}

seed()
