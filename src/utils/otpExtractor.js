// OTP extraction utility
export class OTPExtractor {
  constructor() {
    // Common OTP patterns
    this.patterns = [
      // 6-digit codes (most common)
      /\b\d{6}\b/g,
      // 4-digit codes
      /\b\d{4}\b/g,
      // 8-digit codes
      /\b\d{8}\b/g,
      // Codes with spaces or dashes
      /\b\d{3}[\s-]\d{3}\b/g,
      /\b\d{2}[\s-]\d{2}[\s-]\d{2}\b/g,
      // Alphanumeric codes
      /\b[A-Z0-9]{6}\b/g,
      /\b[A-Z0-9]{4}\b/g,
      /\b[A-Z0-9]{8}\b/g,
    ];

    // Keywords that often appear near OTP codes
    this.otpKeywords = [
      'verification code',
      'verification',
      'authenticate',
      'authentication',
      'confirm',
      'confirmation',
      'security code',
      'access code',
      'login code',
      'sign in code',
      'one-time',
      'otp',
      'pin',
      'passcode',
      'temporary code',
      'verify',
      '2fa',
      'two-factor',
      'mfa',
      'multi-factor'
    ];
  }

  // Extract OTP from email content
  extractOTP(emailContent) {
    if (!emailContent || typeof emailContent !== 'string') {
      return null;
    }

    const content = emailContent.toLowerCase();
    const results = [];

    // Check if the email contains OTP-related keywords
    const hasOTPKeywords = this.otpKeywords.some(keyword => 
      content.includes(keyword.toLowerCase())
    );

    if (!hasOTPKeywords) {
      return null; // Likely not an OTP email
    }

    // Extract potential codes using patterns
    this.patterns.forEach(pattern => {
      const matches = emailContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleanCode = match.replace(/[\s-]/g, ''); // Remove spaces and dashes
          if (this.isValidOTP(cleanCode, emailContent)) {
            results.push({
              code: cleanCode,
              original: match,
              confidence: this.calculateConfidence(cleanCode, emailContent)
            });
          }
        });
      }
    });

    // Sort by confidence and return the best match
    if (results.length > 0) {
      results.sort((a, b) => b.confidence - a.confidence);
      return results[0];
    }

    return null;
  }

  // Validate if a code is likely to be an OTP
  isValidOTP(code, context) {
    // Filter out common false positives
    const falsePositives = [
      /^0+$/, // All zeros
      /^1+$/, // All ones
      /^9+$/, // All nines
      /^(12|21|23|32|34|43|45|54|56|65|67|76|78|87|89|98)+$/, // Sequential patterns
    ];

    // Check against false positive patterns
    if (falsePositives.some(pattern => pattern.test(code))) {
      return false;
    }

    // Must be between 4-8 characters
    if (code.length < 4 || code.length > 8) {
      return false;
    }

    // Check if it appears in a suspicious context (like phone numbers, dates, etc.)
    const suspiciousPatterns = [
      /\b\d{4}[-\/]\d{2}[-\/]\d{2}\b/, // Dates
      /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/, // Phone numbers
      /\$\d+/, // Prices
      /\b\d+%\b/, // Percentages
    ];

    const contextLower = context.toLowerCase();
    const codePosition = contextLower.indexOf(code.toLowerCase());
    
    if (codePosition !== -1) {
      const surroundingText = contextLower.substring(
        Math.max(0, codePosition - 50),
        Math.min(contextLower.length, codePosition + code.length + 50)
      );

      if (suspiciousPatterns.some(pattern => pattern.test(surroundingText))) {
        return false;
      }
    }

    return true;
  }

  // Calculate confidence score for an OTP code
  calculateConfidence(code, context) {
    let confidence = 0;
    const contextLower = context.toLowerCase();

    // Base confidence based on code length (6-digit codes are most common)
    if (code.length === 6) confidence += 40;
    else if (code.length === 4) confidence += 30;
    else if (code.length === 8) confidence += 25;
    else confidence += 10;

    // Check proximity to OTP keywords
    const codePosition = contextLower.indexOf(code.toLowerCase());
    if (codePosition !== -1) {
      this.otpKeywords.forEach(keyword => {
        const keywordPosition = contextLower.indexOf(keyword);
        if (keywordPosition !== -1) {
          const distance = Math.abs(keywordPosition - codePosition);
          if (distance < 100) { // Within 100 characters
            confidence += Math.max(0, 30 - (distance / 10));
          }
        }
      });
    }

    // Bonus for specific formatting patterns
    if (/^\d{6}$/.test(code)) confidence += 20; // Pure 6-digit
    if (/^\d{4}$/.test(code)) confidence += 15; // Pure 4-digit
    if (/^[A-Z0-9]+$/.test(code)) confidence += 10; // Alphanumeric

    // Check for common OTP phrases
    const otpPhrases = [
      'your code is',
      'verification code is',
      'enter the code',
      'use this code',
      'your verification code',
      'authentication code'
    ];

    otpPhrases.forEach(phrase => {
      if (contextLower.includes(phrase)) {
        confidence += 25;
      }
    });

    return Math.min(100, confidence); // Cap at 100
  }

  // Extract OTP from email message object
  extractFromMessage(message) {
    if (!message) return null;

    // Combine subject and snippet for analysis
    const content = `${message.subject || ''} ${message.snippet || ''}`;
    
    return this.extractOTP(content);
  }

  // Check if email is likely to contain OTP
  isOTPEmail(message) {
    if (!message) return false;

    const content = `${message.subject || ''} ${message.snippet || ''}`.toLowerCase();
    
    return this.otpKeywords.some(keyword => 
      content.includes(keyword.toLowerCase())
    );
  }
}

// Create singleton instance
export const otpExtractor = new OTPExtractor(); 