/**
 * Tests for filename sanitization utilities
 */

import { sanitizeFilename, sanitizeFileInfo, validateFilename } from '../filenameUtils';

describe('filenameUtils', () => {
  describe('sanitizeFilename', () => {
    it('should sanitize non-ASCII characters', () => {
      const result = sanitizeFilename('Phi Intelligence – Company Brochure.pdf');
      expect(result).toBe('Phi Intelligence - Company Brochure.pdf');
    });

    it('should handle em dashes', () => {
      const result = sanitizeFilename('Document — Final Version.docx');
      expect(result).toBe('Document - Final Version.docx');
    });

    it('should handle smart quotes', () => {
      const result = sanitizeFilename('"Important" Document.pdf');
      expect(result).toBe('Important Document.pdf');
    });

    it('should handle special characters', () => {
      const result = sanitizeFilename('File@#$%^&*()name.txt');
      expect(result).toBe('File_name.txt');
    });

    it('should handle empty filename', () => {
      const result = sanitizeFilename('');
      expect(result).toBe('unnamed_file');
    });

    it('should handle filename without extension', () => {
      const result = sanitizeFilename('NoExtension');
      expect(result).toBe('NoExtension.txt');
    });

    it('should preserve valid characters', () => {
      const result = sanitizeFilename('Valid_File-Name.123.pdf');
      expect(result).toBe('Valid_File-Name.123.pdf');
    });
  });

  describe('sanitizeFileInfo', () => {
    it('should return sanitization information', () => {
      const result = sanitizeFileInfo('Phi Intelligence – Company Brochure.pdf');
      expect(result.originalName).toBe('Phi Intelligence – Company Brochure.pdf');
      expect(result.sanitizedName).toBe('Phi Intelligence - Company Brochure.pdf');
      expect(result.wasSanitized).toBe(true);
    });

    it('should detect when no sanitization is needed', () => {
      const result = sanitizeFileInfo('Valid_File-Name.pdf');
      expect(result.originalName).toBe('Valid_File-Name.pdf');
      expect(result.sanitizedName).toBe('Valid_File-Name.pdf');
      expect(result.wasSanitized).toBe(false);
    });
  });

  describe('validateFilename', () => {
    it('should validate clean filenames', () => {
      const result = validateFilename('Valid_File-Name.pdf');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid characters', () => {
      const result = validateFilename('Invalid<File>Name.pdf');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Filename contains invalid characters');
    });

    it('should detect non-ASCII characters as warnings', () => {
      const result = validateFilename('Phi Intelligence – Company Brochure.pdf');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Filename contains special characters that will be converted');
    });

    it('should detect long filenames', () => {
      const longName = 'a'.repeat(300) + '.pdf';
      const result = validateFilename(longName);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Filename is too long (max 255 characters)');
    });

    it('should detect reserved names', () => {
      const result = validateFilename('CON.pdf');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Filename is a reserved system name');
    });
  });
});
