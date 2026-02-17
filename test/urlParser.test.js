import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isValidUrl, detectContentType, extractNoteId, extractUsername } from '../src/utils/urlParser.js';

describe('URL Parser', () => {
  describe('isValidUrl', () => {
    it('should accept valid HTTPS URLs', () => {
      assert.strictEqual(isValidUrl('https://example.com'), true);
    });

    it('should accept valid HTTP URLs', () => {
      assert.strictEqual(isValidUrl('http://example.com'), true);
    });

    it('should reject localhost', () => {
      assert.strictEqual(isValidUrl('http://localhost:3000'), false);
    });

    it('should reject private IP ranges', () => {
      assert.strictEqual(isValidUrl('http://192.168.1.1'), false);
      assert.strictEqual(isValidUrl('http://10.0.0.1'), false);
    });

    it('should reject invalid URLs', () => {
      assert.strictEqual(isValidUrl('not-a-url'), false);
    });

    it('should reject non-HTTP protocols', () => {
      assert.strictEqual(isValidUrl('ftp://example.com'), false);
    });
  });

  describe('detectContentType', () => {
    it('should detect note URLs', () => {
      const result = detectContentType('https://misskey.io/notes/abc123');
      assert.strictEqual(result.type, 'note');
      assert.strictEqual(result.id, 'abc123');
      assert.strictEqual(result.domain, 'misskey.io');
    });

    it('should detect profile URLs with @', () => {
      const result = detectContentType('https://misskey.io/@alice');
      assert.strictEqual(result.type, 'profile');
      assert.strictEqual(result.username, 'alice');
      assert.strictEqual(result.domain, 'misskey.io');
    });

    it('should detect profile URLs with /users/', () => {
      const result = detectContentType('https://misskey.io/users/user123');
      assert.strictEqual(result.type, 'profile');
      assert.strictEqual(result.userId, 'user123');
      assert.strictEqual(result.domain, 'misskey.io');
    });

    it('should detect instance URLs', () => {
      const result = detectContentType('https://misskey.io');
      assert.strictEqual(result.type, 'instance');
      assert.strictEqual(result.domain, 'misskey.io');
    });
  });

  describe('extractNoteId', () => {
    it('should extract note ID from URL', () => {
      assert.strictEqual(extractNoteId('https://misskey.io/notes/abc123'), 'abc123');
    });

    it('should return null for URLs without note ID', () => {
      assert.strictEqual(extractNoteId('https://misskey.io/@alice'), null);
    });
  });

  describe('extractUsername', () => {
    it('should extract username from profile URL', () => {
      assert.strictEqual(extractUsername('https://misskey.io/@alice'), 'alice');
    });

    it('should return null for URLs without username', () => {
      assert.strictEqual(extractUsername('https://misskey.io/notes/abc123'), null);
    });
  });
});
