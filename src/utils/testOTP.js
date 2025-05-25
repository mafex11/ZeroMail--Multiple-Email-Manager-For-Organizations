// Test OTP extraction functionality
import { otpExtractor } from './otpExtractor.js';

// Test cases for OTP extraction
const testCases = [
  {
    name: "Google verification code",
    content: "Your Google verification code is 123456. Use this code to complete your sign-in.",
    expected: "123456"
  },
  {
    name: "Bank OTP",
    content: "Your one-time password for banking is 789012. This code expires in 5 minutes.",
    expected: "789012"
  },
  {
    name: "Social media 2FA",
    content: "Your Instagram login code is 456789. Don't share this with anyone.",
    expected: "456789"
  },
  {
    name: "Email with multiple numbers (should pick OTP)",
    content: "Your order #12345 has been confirmed. Your verification code is 987654. Total: $29.99",
    expected: "987654"
  },
  {
    name: "4-digit PIN",
    content: "Your security PIN is 5678. Enter this to access your account.",
    expected: "5678"
  },
  {
    name: "No OTP email",
    content: "Thank you for your purchase. Your order will arrive in 2-3 business days.",
    expected: null
  }
];

// Run tests
export function runOTPTests() {
  console.log('🧪 Running OTP Extraction Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    const result = otpExtractor.extractOTP(testCase.content);
    const extractedCode = result ? result.code : null;
    
    const success = extractedCode === testCase.expected;
    
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log(`Content: "${testCase.content}"`);
    console.log(`Expected: ${testCase.expected}`);
    console.log(`Got: ${extractedCode}`);
    console.log(`Result: ${success ? '✅ PASS' : '❌ FAIL'}`);
    
    if (result && result.confidence) {
      console.log(`Confidence: ${result.confidence}%`);
    }
    
    console.log('---\n');
    
    if (success) {
      passed++;
    } else {
      failed++;
    }
  });
  
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log(`Success rate: ${Math.round((passed / testCases.length) * 100)}%`);
  
  return { passed, failed, total: testCases.length };
}

// Test with mock message format
export function testWithMockMessage() {
  const mockMessage = {
    id: 'test-123',
    subject: 'Your verification code',
    snippet: 'Your Google verification code is 123456. Use this code to complete your sign-in.',
    from: 'noreply@google.com',
    date: new Date().toISOString(),
    accountEmail: 'test@gmail.com'
  };
  
  console.log('🔍 Testing with mock message format...');
  console.log('Message:', mockMessage);
  
  const isOTPEmail = otpExtractor.isOTPEmail(mockMessage);
  console.log('Is OTP Email:', isOTPEmail);
  
  if (isOTPEmail) {
    const result = otpExtractor.extractFromMessage(mockMessage);
    console.log('Extracted OTP:', result);
  }
  
  return mockMessage;
} 