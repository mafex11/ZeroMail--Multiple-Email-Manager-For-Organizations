// Content script for OTP detection and autofill
(function() {
  'use strict';

  let lastDetectedOTP = null;
  let otpInputFields = [];

  // Common OTP input field selectors
  const OTP_SELECTORS = [
    'input[type="text"][autocomplete*="one-time-code"]',
    'input[type="text"][name*="otp"]',
    'input[type="text"][name*="code"]',
    'input[type="text"][name*="verification"]',
    'input[type="text"][name*="verify"]',
    'input[type="text"][id*="otp"]',
    'input[type="text"][id*="code"]',
    'input[type="text"][id*="verification"]',
    'input[type="text"][id*="verify"]',
    'input[type="number"][name*="otp"]',
    'input[type="number"][name*="code"]',
    'input[type="number"][id*="otp"]',
    'input[type="number"][id*="code"]',
    'input[type="tel"][name*="otp"]',
    'input[type="tel"][name*="code"]',
    'input[type="tel"][id*="otp"]',
    'input[type="tel"][id*="code"]',
    // Common patterns for multi-digit OTP inputs
    'input[maxlength="1"]',
    'input[maxlength="6"]',
    'input[maxlength="4"]',
    'input[maxlength="8"]'
  ];

  // Function to detect OTP input fields
  function detectOTPFields() {
    const fields = [];
    
    OTP_SELECTORS.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Additional validation to ensure it's likely an OTP field
        if (isLikelyOTPField(element)) {
          fields.push(element);
        }
      });
    });

    // Also look for groups of single-digit inputs (common OTP pattern)
    const singleDigitInputs = document.querySelectorAll('input[maxlength="1"]');
    if (singleDigitInputs.length >= 4 && singleDigitInputs.length <= 8) {
      // Check if they're grouped together (likely OTP)
      const firstInput = singleDigitInputs[0];
      const container = firstInput.closest('div, form, fieldset');
      if (container) {
        const containerInputs = container.querySelectorAll('input[maxlength="1"]');
        if (containerInputs.length === singleDigitInputs.length) {
          fields.push(...containerInputs);
        }
      }
    }

    return [...new Set(fields)]; // Remove duplicates
  }

  // Function to check if an input field is likely for OTP
  function isLikelyOTPField(element) {
    const text = (element.placeholder + ' ' + element.name + ' ' + element.id + ' ' + element.className).toLowerCase();
    const otpKeywords = ['otp', 'code', 'verification', 'verify', 'auth', 'token', 'pin', 'sms', '2fa', 'mfa'];
    
    return otpKeywords.some(keyword => text.includes(keyword)) || 
           element.autocomplete === 'one-time-code' ||
           (element.maxLength >= 4 && element.maxLength <= 8 && element.type !== 'password');
  }

  // Function to fill OTP in detected fields
  function fillOTP(otpCode) {
    const fields = detectOTPFields();
    
    if (fields.length === 0) return false;

    // Handle single input field
    if (fields.length === 1) {
      const field = fields[0];
      field.value = otpCode;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    // Handle multiple single-digit inputs
    const digits = otpCode.replace(/\D/g, ''); // Remove non-digits
    if (fields.length > 1 && digits.length >= fields.length) {
      fields.forEach((field, index) => {
        if (index < digits.length) {
          field.value = digits[index];
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      return true;
    }

    return false;
  }

  // Function to copy OTP to clipboard
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showNotification(`OTP copied to clipboard: ${text}`);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  }

  // Function to show notification
  function showNotification(message) {
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2563eb;
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      font-family: Arial, sans-serif;
      font-size: 16px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      animation: slideIn 0.3s ease-out;
      min-width: 280px;
      max-width: 400px;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#otp-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'otp-notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Listen for messages from the extension
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'detectOTPFields') {
      const fields = detectOTPFields();
      sendResponse({ 
        hasOTPFields: fields.length > 0, 
        fieldCount: fields.length,
        url: window.location.href
      });
    } else if (request.action === 'fillOTP') {
      const success = fillOTP(request.otpCode);
      if (success) {
        showNotification(`OTP auto-filled: ${request.otpCode}`);
      }
      sendResponse({ success });
    } else if (request.action === 'copyOTP') {
      copyToClipboard(request.otpCode).then(success => {
        sendResponse({ success });
      });
      return true; // Keep message channel open for async response
    }
  });

  // Debounced function to check for OTP fields
  let debounceTimer = null;
  function debouncedOTPCheck() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const newOTPFields = detectOTPFields();
      if (newOTPFields.length > otpInputFields.length) {
        otpInputFields = newOTPFields;
        // Notify extension that new OTP fields were detected
        chrome.runtime.sendMessage({
          action: 'otpFieldsDetected',
          fieldCount: newOTPFields.length,
          url: window.location.href
        });
      }
    }, 500); // Wait 500ms before checking
  }

  // Monitor for new OTP fields being added to the page
  const observer = new MutationObserver((mutations) => {
    let hasRelevantChanges = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node contains input elements
            if (node.tagName === 'INPUT' || node.querySelector('input')) {
              hasRelevantChanges = true;
            }
          }
        });
      }
    });
    
    // Only check for OTP fields if there were relevant changes
    if (hasRelevantChanges) {
      debouncedOTPCheck();
    }
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial detection
  setTimeout(() => {
    otpInputFields = detectOTPFields();
    if (otpInputFields.length > 0) {
      chrome.runtime.sendMessage({
        action: 'otpFieldsDetected',
        fieldCount: otpInputFields.length,
        url: window.location.href
      });
    }
  }, 1000);

})(); 