import { describe, it } from 'node:test';
import assert from 'node:assert';
import { sanitizeNoteContent, stripHtml, truncateText } from '../src/utils/sanitizer.js';

describe('Sanitizer', () => {
  describe('sanitizeNoteContent', () => {
    it('should allow safe HTML tags', () => {
      const html = '<p>Hello <strong>world</strong></p>';
      const result = sanitizeNoteContent(html);
      assert.ok(result.includes('<p>'));
      assert.ok(result.includes('<strong>'));
    });

    it('should remove script tags', () => {
      const html = '<p>Hello</p><script>alert("xss")</script>';
      const result = sanitizeNoteContent(html);
      assert.ok(!result.includes('<script>'));
      assert.ok(result.includes('<p>'));
    });

    it('should add rel attributes to links', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = sanitizeNoteContent(html);
      assert.ok(result.includes('rel="noopener noreferrer nofollow"'));
    });

    it('should handle empty input', () => {
      assert.strictEqual(sanitizeNoteContent(''), '');
      assert.strictEqual(sanitizeNoteContent(null), '');
    });
  });

  describe('stripHtml', () => {
    it('should remove all HTML tags', () => {
      const html = '<p>Hello <strong>world</strong></p>';
      const result = stripHtml(html);
      assert.strictEqual(result, 'Hello world');
    });

    it('should handle empty input', () => {
      assert.strictEqual(stripHtml(''), '');
      assert.strictEqual(stripHtml(null), '');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const text = 'a'.repeat(300);
      const result = truncateText(text, 200);
      assert.strictEqual(result.length, 200);
      assert.ok(result.endsWith('...'));
    });

    it('should not truncate short text', () => {
      const text = 'Hello world';
      const result = truncateText(text, 200);
      assert.strictEqual(result, text);
    });

    it('should handle empty input', () => {
      assert.strictEqual(truncateText('', 200), '');
      assert.strictEqual(truncateText(null, 200), '');
    });
  });
});
