import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../utils/password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should return a hash string different from the original password', async () => {
      const password = 'mySecurePassword123!';
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
    });

    it('should produce a bcrypt-formatted hash', async () => {
      const hash = await hashPassword('testPassword');
      // bcrypt hashes start with $2a$ or $2b$ and are 60 characters long
      expect(hash).toMatch(/^\$2[ab]\$/);
      expect(hash.length).toBe(60);
    });

    it('should produce different hashes for the same password (due to salting)', async () => {
      const password = 'samePassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hashes for different passwords', async () => {
      const hash1 = await hashPassword('password1');
      const hash2 = await hashPassword('password2');
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string password', async () => {
      const hash = await hashPassword('');
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(1000);
      const hash = await hashPassword(longPassword);
      expect(hash).toBeDefined();
      expect(hash.length).toBe(60);
    });

    it('should handle passwords with special characters', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const hash = await hashPassword(specialPassword);
      expect(hash).toBeDefined();
    });

    it('should handle passwords with unicode characters', async () => {
      const unicodePassword = 'password-ciao-mondo';
      const hash = await hashPassword(unicodePassword);
      expect(hash).toBeDefined();
    });
  });

  describe('verifyPassword', () => {
    it('should return true for a matching password and hash', async () => {
      const password = 'mySecurePassword123!';
      const hash = await hashPassword(password);
      const result = await verifyPassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for a non-matching password', async () => {
      const hash = await hashPassword('correctPassword');
      const result = await verifyPassword('wrongPassword', hash);
      expect(result).toBe(false);
    });

    it('should return false for a similar but not identical password', async () => {
      const hash = await hashPassword('Password');
      const result = await verifyPassword('password', hash);
      expect(result).toBe(false);
    });

    it('should return false when password has extra whitespace', async () => {
      const hash = await hashPassword('password');
      const result = await verifyPassword(' password', hash);
      expect(result).toBe(false);
    });

    it('should verify correctly for empty string password', async () => {
      const hash = await hashPassword('');
      const resultMatch = await verifyPassword('', hash);
      const resultNoMatch = await verifyPassword('notempty', hash);
      expect(resultMatch).toBe(true);
      expect(resultNoMatch).toBe(false);
    });

    it('should verify correctly for passwords with special characters', async () => {
      const password = '!@#$%^&*()';
      const hash = await hashPassword(password);
      const result = await verifyPassword(password, hash);
      expect(result).toBe(true);
    });
  });
});
