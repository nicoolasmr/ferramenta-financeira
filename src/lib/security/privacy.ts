export function maskEmail(email: string): string {
    if (!email) return "";
    const [local, domain] = email.split("@");
    if (!domain) return email; // Invalid email

    const maskedLocal = local.length > 2
        ? `${local.substring(0, 2)}***`
        : `${local}***`;

    return `${maskedLocal}@${domain}`;
}

export function maskPhone(phone: string): string {
    if (!phone) return "";
    // Assume format +55 11 99999-9999 or similar
    // Keep last 4 digits
    return phone.replace(/.(?=.{4})/g, "*");
}

export function shouldMaskPII(orgSettings: any): boolean {
    // If we had a settings table synced to client, we'd check it here.
    // For now, we default to false unless strictly required.
    // Or check an env var.
    return process.env.NEXT_PUBLIC_MASK_PII === 'true';
}
