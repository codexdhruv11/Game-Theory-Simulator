import { randomBytes } from 'crypto';

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function generateSecureId(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

export function generateGuestId(): string {
  return `guest_${Date.now()}_${generateSecureId(8)}`;
}