/**
 * Seed Script
 * Generates SQL statements to populate the database with mock data.
 * Usage: npx tsx scripts/seed.ts > supabase/seed.sql
 */

import { faker } from '@faker-js/faker';

const TABLES = {
    ORGS: 3,
    CUSTOMERS_PER_ORG: 30, // 3 * 30 = 90
    PRODUCTS_PER_ORG: 10,
    ORDERS_PER_ORG: 60, // 3 * 60 = 180 total
    PAYMENTS_PER_ORDER: 1, // Mostly 1, some 2
};

type OrgSeed = {
    id: string;
    name: string;
    slug: string;
};

type ProductSeed = {
    id: string;
    org_id: string;
    price: number;
};

type CustomerSeed = {
    id: string;
    org_id: string;
    email: string;
};

type OrderItemSeed = {
    product_id: string;
    qty: number;
    unit_price: number;
    discount: number;
};

function generateUUID() {
    return faker.string.uuid();
}

function escapeSQL(str: string | undefined | null) {
    if (str === undefined || str === null) return 'NULL';
    return `'${str.replace(/'/g, "''")}'`;
}

function main() {
    console.log('-- Seeding Data');
    console.log('BEGIN;');

    // 1. Create Orgs
    const orgs: OrgSeed[] = [];
    for (let i = 0; i < TABLES.ORGS; i++) {
        const id = generateUUID();
        const name = faker.company.name();
        const slug = faker.helpers.slugify(name).toLowerCase() + '-' + faker.string.alpha(4);
        orgs.push({ id, name, slug });
        console.log(`INSERT INTO public.organizations (id, name, slug) VALUES ('${id}', ${escapeSQL(name)}, '${slug}');`);
    }

    // 2. Create Products
    const products: ProductSeed[] = [];
    for (const org of orgs) {
        for (let i = 0; i < TABLES.PRODUCTS_PER_ORG; i++) {
            const id = generateUUID();
            const name = faker.commerce.productName();
            const price = parseInt(faker.commerce.price({ min: 1000, max: 50000, dec: 0 }));
            products.push({ id, org_id: org.id, price });
            console.log(`INSERT INTO public.products (id, org_id, name, price_cents) VALUES ('${id}', '${org.id}', ${escapeSQL(name)}, ${price});`);
        }
    }

    // 3. Create Customers
    const customers: CustomerSeed[] = [];
    for (const org of orgs) {
        for (let i = 0; i < TABLES.CUSTOMERS_PER_ORG; i++) {
            const id = generateUUID();
            const email = faker.internet.email();
            customers.push({ id, org_id: org.id, email });
            console.log(`INSERT INTO public.customers (id, org_id, name, email, phone) VALUES ('${id}', '${org.id}', ${escapeSQL(faker.person.fullName())}, '${email}', '${faker.phone.number()}');`);
        }
    }

    // 4. Create Orders & Order Items & Payments
    for (const org of orgs) {
        const orgCustomers = customers.filter(c => c.org_id === org.id);
        const orgProducts = products.filter(p => p.org_id === org.id);

        for (let i = 0; i < TABLES.ORDERS_PER_ORG; i++) {
            const customer = faker.helpers.arrayElement(orgCustomers);
            const id = generateUUID();
            const purchaseDate = faker.date.past().toISOString();

            // Random Status
            const status = faker.helpers.weightedArrayElement([
                { weight: 80, value: 'paid' },
                { weight: 10, value: 'pending' },
                { weight: 5, value: 'canceled' },
                { weight: 5, value: 'refunded' },
            ]);

            // Calculate amounts based on items
            const numItems = faker.number.int({ min: 1, max: 4 });
            let gross = 0;

            // Create Order first (we update amounts later ideally, but for SQL insert we need it now)
            // Let's generate items first in memory
            const items: OrderItemSeed[] = [];
            for (let k = 0; k < numItems; k++) {
                const product = faker.helpers.arrayElement(orgProducts);
                const qty = faker.number.int({ min: 1, max: 2 });
                const lineTotal = product.price * qty;
                gross += lineTotal;
                items.push({ product_id: product.id, qty, unit_price: product.price, discount: 0 });
            }

            const tax = Math.floor(gross * 0.1);
            const fees = Math.floor(gross * 0.03); // 3% gateway fee
            const net = gross - tax - fees;

            console.log(`INSERT INTO public.orders (id, org_id, customer_id, status, gross_amount_cents, net_amount_cents, fees_cents, tax_cents, purchase_datetime) 
            VALUES ('${id}', '${org.id}', '${customer.id}', '${status}', ${gross}, ${net}, ${fees}, ${tax}, '${purchaseDate}');`);

            // Insert Items
            for (const item of items) {
                console.log(`INSERT INTO public.order_items (org_id, order_id, product_id, qty, unit_price_cents, discount_cents)
                VALUES ('${org.id}', '${id}', '${item.product_id}', ${item.qty}, ${item.unit_price}, ${item.discount});`);
            }

            // Payments (if paid or refunded)
            if (['paid', 'refunded', 'chargeback'].includes(status)) {
                const paymentId = generateUUID();
                const method = faker.helpers.arrayElement(['credit_card', 'pix', 'boleto']);
                console.log(`INSERT INTO public.payments (id, org_id, order_id, method, gateway, status, amount_cents, paid_at)
                VALUES ('${paymentId}', '${org.id}', '${id}', '${method}', 'stripe_stub', 'captured', ${gross}, '${purchaseDate}');`);

                if (status === 'refunded') {
                    console.log(`INSERT INTO public.refunds (org_id, order_id, payment_id, amount_cents, reason, refunded_at)
                    VALUES ('${org.id}', '${id}', '${paymentId}', ${gross}, 'Customer request', '${faker.date.recent().toISOString()}');`);
                }
            }
        }
    }

    console.log('COMMIT;');
    console.log('-- Seeding Complete');
}

main();
