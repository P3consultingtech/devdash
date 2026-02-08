import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

// Mock the env config before importing jwt utils
vi.mock('../../config/env', () => ({
  env: {
    JWT_SECRET: 'test-jwt-secret-at-least-16-chars',
    JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-16',
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
  },
}));

import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  type JwtPayload,
} from '../../utils/jwt';

describe('JWT Utilities', () => {
  const testPayload: JwtPayload = {
    userId: 'user-123',
    email: 'test@example.com',
  };

  describe('signAccessToken', () => {
    it('should return a non-empty string token', () => {
      const token = signAccessToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should produce a valid JWT with three dot-separated parts', () => {
      const token = signAccessToken(testPayload);
      const parts = token.split('.');
      expect(parts).toHaveLength(3);
    });

    it('should embed userId and email in the token payload', () => {
      const token = signAccessToken(testPayload);
      const decoded = jwt.decode(token) as Record<string, unknown>;
      expect(decoded.userId).toBe('user-123');
      expect(decoded.email).toBe('test@example.com');
    });

    it('should include an expiration claim (exp)', () => {
      const token = signAccessToken(testPayload);
      const decoded = jwt.decode(token) as Record<string, unknown>;
      expect(decoded.exp).toBeDefined();
      expect(typeof decoded.exp).toBe('number');
    });

    it('should produce different tokens for different payloads', () => {
      const token1 = signAccessToken(testPayload);
      const token2 = signAccessToken({ userId: 'user-456', email: 'other@example.com' });
      expect(token1).not.toBe(token2);
    });
  });

  describe('signRefreshToken', () => {
    it('should return a non-empty string token', () => {
      const token = signRefreshToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should embed userId and email in the token payload', () => {
      const token = signRefreshToken(testPayload);
      const decoded = jwt.decode(token) as Record<string, unknown>;
      expect(decoded.userId).toBe('user-123');
      expect(decoded.email).toBe('test@example.com');
    });

    it('should produce a token different from the access token', () => {
      const accessToken = signAccessToken(testPayload);
      const refreshToken = signRefreshToken(testPayload);
      // They use different secrets so they will differ
      expect(accessToken).not.toBe(refreshToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should return the original payload for a valid access token', () => {
      const token = signAccessToken(testPayload);
      const result = verifyAccessToken(token);
      expect(result.userId).toBe('user-123');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw for a token signed with the wrong secret', () => {
      const wrongToken = jwt.sign(testPayload, 'wrong-secret-string-1234');
      expect(() => verifyAccessToken(wrongToken)).toThrow();
    });

    it('should throw for a completely invalid token string', () => {
      expect(() => verifyAccessToken('not.a.valid.token')).toThrow();
    });

    it('should throw for an empty string', () => {
      expect(() => verifyAccessToken('')).toThrow();
    });

    it('should throw for an expired access token', () => {
      const expiredToken = jwt.sign(testPayload, 'test-jwt-secret-at-least-16-chars', {
        expiresIn: '-10s',
      });
      expect(() => verifyAccessToken(expiredToken)).toThrow();
    });

    it('should throw for a refresh token verified as access token', () => {
      const refreshToken = signRefreshToken(testPayload);
      // Refresh token is signed with a different secret, so verify should fail
      expect(() => verifyAccessToken(refreshToken)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return the original payload for a valid refresh token', () => {
      const token = signRefreshToken(testPayload);
      const result = verifyRefreshToken(token);
      expect(result.userId).toBe('user-123');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw for a token signed with the wrong secret', () => {
      const wrongToken = jwt.sign(testPayload, 'wrong-secret-string-1234');
      expect(() => verifyRefreshToken(wrongToken)).toThrow();
    });

    it('should throw for a completely invalid token string', () => {
      expect(() => verifyRefreshToken('garbage-token')).toThrow();
    });

    it('should throw for an expired refresh token', () => {
      const expiredToken = jwt.sign(testPayload, 'test-refresh-secret-at-least-16', {
        expiresIn: '-10s',
      });
      expect(() => verifyRefreshToken(expiredToken)).toThrow();
    });

    it('should throw for an access token verified as refresh token', () => {
      const accessToken = signAccessToken(testPayload);
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });
});
