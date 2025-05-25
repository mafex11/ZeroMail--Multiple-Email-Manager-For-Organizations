// OTP Service for handling OTP detection and autofill
import { otpExtractor } from './otpExtractor.js';
import { performanceMonitor } from './performance.js';

export class OTPService {
  constructor() {
    this.lastProcessedMessages = new Set();
    this.recentOTPs = new Map(); // Store recent OTPs with timestamps
    this.isMonitoring = false;
  }

  // Start monitoring for OTP emails
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('OTP monitoring started');
    
    // Listen for messages from content scripts
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        this.handleContentScriptMessage(request, sender, sendResponse);
      });
    }
  }

  // Stop monitoring
  stopMonitoring() {
    this.isMonitoring = false;
    console.log('OTP monitoring stopped');
  }

  // Process new messages for OTP codes
  processMessages(messages) {
    return performanceMonitor.measure('processOTPMessages', () => {
    if (!messages || !Array.isArray(messages)) return;

    const newOTPs = [];
    
    messages.forEach(message => {
      // Skip if we've already processed this message
      if (this.lastProcessedMessages.has(message.id)) return;
      
      // Only process recent messages (within last 10 minutes)
      const messageDate = new Date(message.date);
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      
      if (messageDate < tenMinutesAgo) return;
      
      // Check if message contains OTP
      if (otpExtractor.isOTPEmail(message)) {
        const otpResult = otpExtractor.extractFromMessage(message);
        
        if (otpResult && otpResult.confidence > 50) {
          const otpData = {
            code: otpResult.code,
            confidence: otpResult.confidence,
            messageId: message.id,
            subject: message.subject,
            from: message.from,
            timestamp: Date.now(),
            accountEmail: message.accountEmail
          };
          
          newOTPs.push(otpData);
          this.recentOTPs.set(otpResult.code, otpData);
          
          console.log('OTP detected:', otpData);
        }
      }
      
      this.lastProcessedMessages.add(message.id);
    });

    // Clean up old processed messages (keep only last 500, reduced from 1000)
    if (this.lastProcessedMessages.size > 500) {
      const entries = Array.from(this.lastProcessedMessages);
      this.lastProcessedMessages = new Set(entries.slice(-250));
    }

    // Clean up old OTPs (older than 2 minutes)
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    for (const [code, data] of this.recentOTPs.entries()) {
      if (data.timestamp < twoMinutesAgo) {
        this.recentOTPs.delete(code);
      }
    }

    // Process new OTPs
    if (newOTPs.length > 0) {
      this.handleNewOTPs(newOTPs);
    }
    });
  }

  // Handle newly detected OTPs
  async handleNewOTPs(otps) {
    for (const otp of otps) {
      try {
        // Check if there are any active tabs with OTP fields
        const tabs = await this.getActiveTabsWithOTPFields();
        
        if (tabs.length > 0) {
          // Try to autofill in the most recent tab first
          const success = await this.autofillOTP(otp.code, tabs[0]);
          
          if (success) {
            this.showNotification(`OTP auto-filled: ${otp.code}`, 'success');
          } else {
            // If autofill failed, copy to clipboard
            await this.copyOTPToClipboard(otp.code);
          }
        } else {
          // No OTP fields detected, just copy to clipboard
          await this.copyOTPToClipboard(otp.code);
        }
      } catch (error) {
        console.error('Error handling OTP:', error);
      }
    }
  }

  // Get active tabs that have OTP input fields
  async getActiveTabsWithOTPFields() {
    if (typeof chrome === 'undefined' || !chrome.tabs) return [];

    try {
      const tabs = await chrome.tabs.query({ active: true });
      const tabsWithOTP = [];

      for (const tab of tabs) {
        try {
          const response = await chrome.tabs.sendMessage(tab.id, { 
            action: 'detectOTPFields' 
          });
          
          if (response && response.hasOTPFields) {
            tabsWithOTP.push({
              ...tab,
              otpFieldCount: response.fieldCount
            });
          }
        } catch (error) {
          // Tab might not have content script injected
          console.log('Could not check OTP fields in tab:', tab.url);
        }
      }

      return tabsWithOTP;
    } catch (error) {
      console.error('Error getting tabs with OTP fields:', error);
      return [];
    }
  }

  // Autofill OTP in a specific tab
  async autofillOTP(otpCode, tab) {
    if (typeof chrome === 'undefined' || !chrome.tabs) return false;

    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'fillOTP',
        otpCode: otpCode
      });

      return response && response.success;
    } catch (error) {
      console.error('Error autofilling OTP:', error);
      return false;
    }
  }

  // Copy OTP to clipboard
  async copyOTPToClipboard(otpCode) {
    try {
      // Try using the modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(otpCode);
        this.showNotification(`OTP copied to clipboard: ${otpCode}`, 'info');
        return true;
      }
      
      // Fallback: try using content script to copy
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0) {
        const response = await chrome.tabs.sendMessage(tabs[0].id, {
          action: 'copyOTP',
          otpCode: otpCode
        });
        
        if (response && response.success) {
          this.showNotification(`OTP copied to clipboard: ${otpCode}`, 'info');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error copying OTP to clipboard:', error);
      return false;
    }
  }

  // Show notification
  showNotification(message, type = 'info') {
    if (typeof chrome !== 'undefined' && chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'Fusion Mail - OTP Detected',
        message: message
      });
    } else {
      console.log('OTP Notification:', message);
    }
  }

  // Handle messages from content scripts
  handleContentScriptMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'otpFieldsDetected':
        console.log(`OTP fields detected on ${request.url}: ${request.fieldCount} fields`);
        
        // Check if we have any recent OTPs to autofill
        const recentOTP = this.getMostRecentOTP();
        if (recentOTP) {
          // Try to autofill the most recent OTP
          chrome.tabs.sendMessage(sender.tab.id, {
            action: 'fillOTP',
            otpCode: recentOTP.code
          }).then(response => {
            if (response && response.success) {
              console.log('Auto-filled recent OTP:', recentOTP.code);
            }
          }).catch(error => {
            console.error('Error auto-filling recent OTP:', error);
          });
        }
        break;
        
      default:
        break;
    }
  }

  // Get the most recent OTP (within last 2 minutes)
  getMostRecentOTP() {
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    let mostRecent = null;
    
    for (const [code, data] of this.recentOTPs.entries()) {
      if (data.timestamp > twoMinutesAgo) {
        if (!mostRecent || data.timestamp > mostRecent.timestamp) {
          mostRecent = data;
        }
      }
    }
    
    return mostRecent;
  }

  // Get all recent OTPs (within last 2 minutes)
  getRecentOTPs() {
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    const recent = [];
    
    for (const [code, data] of this.recentOTPs.entries()) {
      if (data.timestamp > twoMinutesAgo) {
        recent.push(data);
      }
    }
    
    return recent.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Manually trigger OTP copy/autofill
  async manuallyHandleOTP(otpCode) {
    const tabs = await this.getActiveTabsWithOTPFields();
    
    if (tabs.length > 0) {
      const success = await this.autofillOTP(otpCode, tabs[0]);
      if (!success) {
        await this.copyOTPToClipboard(otpCode);
      }
    } else {
      await this.copyOTPToClipboard(otpCode);
    }
  }
}

// Create singleton instance
export const otpService = new OTPService(); 