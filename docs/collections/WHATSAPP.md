# WhatsApp Collections — Guide

Recovering revenue via WhatsApp is a game changer for retention. RevenueOS implements a "WhatsApp-First" strategy.

## Opt-in Requirement
All customers must have an explicit opt-in recorded in `contact_consent` before any automated message is sent.

## Templates
We strictly use Meta-approved templates. 
Current templates include:
- `friendly_reminder`: 1-3 days before/after due date.
- `overdue_notice`: 4-10 days overdue.
- `payment_confirmation`: automated thank you message.

## Recovery Rules
Our deterministic engine decides the next action based on:
1. Days Overdue
2. Payment Method (Pix is always prioritized for immediate recovery)
3. Risk Score of the customer.
