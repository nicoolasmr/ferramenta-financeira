
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Encrypts valid string/JSON using AES-256-GCM.
 * Used for storing sensitive API keys in DB.
 */
export function encrypt(text: string, masterKey: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Derive generic key from masterKey + salt (if master key is a password)
    // But usually for internal usage we assume masterKey IS 32 bytes hex or base64.
    // To be safe and robust, let's use scrypt to derive a 32 byte key.

    // HOWEVER, to keep it fast for high throughput, if masterKey is guaranteed strong, we can use it directly?
    // Let's stick to key derivation to avoid weak key issues.

    const key = crypto.scryptSync(masterKey, salt, 32);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Format: salt:iv:tag:encrypted
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

/**
 * Decrypts string.
 */
export function decrypt(encryptedText: string, masterKey: string): string {
    const buffer = Buffer.from(encryptedText, 'base64');

    // Extract parts
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const text = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const key = crypto.scryptSync(masterKey, salt, 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(text) + decipher.final('utf8');
}
