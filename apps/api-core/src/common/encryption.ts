import * as crypto from 'crypto';

// CLÉ EN DUR (32 caractères exactement) - Ne touchez plus à ça !
const ENCRYPTION_KEY = '12345678901234567890123456789012';
const IV_LENGTH = 16; // Pour AES, c'est toujours 16

export function encrypt(text: string): string {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        // On stocke l'IV avec le texte chiffré (séparé par :)
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('Encryption error:', error);
        return text; // En cas d'erreur, on retourne le texte (ou on throw)
    }
}

export function decrypt(text: string): string {
    if (!text) return text;
    try {
        const textParts = text.split(':');
        // Si le format n'est pas bon (pas de ':'), c'est que ce n'est pas chiffré
        if (textParts.length < 2) return text;

        const iv = Buffer.from(textParts.shift()!, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption error (Wrong Key?):', error);
        return text; // Retourne le texte tel quel si échec
    }
}

/**
 * Mask a secret string for display (e.g., "sk_live_abc123" -> "sk_l****")
 */
export function maskSecret(secret: string, visibleChars = 4): string {
    if (!secret || secret.length <= visibleChars) {
        return '****';
    }
    return secret.substring(0, visibleChars) + '****';
}
