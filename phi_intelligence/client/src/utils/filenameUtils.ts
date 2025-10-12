/**
 * Filename sanitization utilities for safe file uploads
 */

export interface SanitizedFile {
  originalName: string;
  sanitizedName: string;
  wasSanitized: boolean;
}

/**
 * Sanitize filename to be safe for storage systems
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed_file';
  
  // Normalize unicode characters
  let sanitized = filename.normalize('NFKD');
  
  // Replace non-ASCII characters with ASCII equivalents
  sanitized = sanitized.replace(/[^\x00-\x7F]/g, (char) => {
    // Common character replacements
    const replacements: Record<string, string> = {
      '–': '-',  // en dash
      '—': '-',  // em dash
      '\u2018': "'",  // left single quotation mark
      '\u2019': "'",  // right single quotation mark
      '\u201C': '"',  // left double quotation mark
      '\u201D': '"',  // right double quotation mark
      '…': '...', // horizontal ellipsis
      '•': '*',  // bullet
      '°': 'deg', // degree sign
      '©': '(c)', // copyright
      '®': '(r)', // registered
      '™': '(tm)', // trademark
    };
    
    return replacements[char] || '_';
  });
  
  // Replace problematic characters with underscores
  sanitized = sanitized.replace(/[^\w\s\-_\.]/g, '_');
  
  // Remove multiple consecutive underscores/spaces
  sanitized = sanitized.replace(/[_\s]+/g, '_');
  
  // Remove leading/trailing underscores
  sanitized = sanitized.trim().replace(/^_+|_+$/g, '');
  
  // Ensure filename is not empty
  if (!sanitized) {
    sanitized = 'unnamed_file';
  }
  
  // Ensure filename has an extension
  if (!sanitized.includes('.')) {
    sanitized += '.txt';
  }
  
  return sanitized;
}

/**
 * Sanitize filename and return detailed information
 * @param filename - Original filename
 * @returns Sanitized file information
 */
export function sanitizeFileInfo(filename: string): SanitizedFile {
  const sanitizedName = sanitizeFilename(filename);
  const wasSanitized = filename !== sanitizedName;
  
  return {
    originalName: filename,
    sanitizedName,
    wasSanitized
  };
}

/**
 * Validate filename for upload
 * @param filename - Filename to validate
 * @returns Validation result
 */
export function validateFilename(filename: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!filename) {
    errors.push('Filename is required');
    return { isValid: false, errors, warnings };
  }
  
  // Check for non-ASCII characters
  if (!/^[\x00-\x7F]*$/.test(filename)) {
    warnings.push('Filename contains special characters that will be converted');
  }
  
  // Check for problematic characters
  if (/[<>:"/\\|?*]/.test(filename)) {
    errors.push('Filename contains invalid characters');
  }
  
  // Check filename length
  if (filename.length > 255) {
    errors.push('Filename is too long (max 255 characters)');
  }
  
  // Check for reserved names (Windows)
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
  const nameWithoutExt = filename.split('.')[0].toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    errors.push('Filename is a reserved system name');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get file extension from filename
 * @param filename - Filename
 * @returns File extension (including dot)
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(lastDot) : '';
}

/**
 * Get filename without extension
 * @param filename - Filename
 * @returns Filename without extension
 */
export function getFilenameWithoutExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(0, lastDot) : filename;
}
