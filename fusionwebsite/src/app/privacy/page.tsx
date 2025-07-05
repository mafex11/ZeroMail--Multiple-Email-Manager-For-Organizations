"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Database, CreditCard, Mail, Chrome, Zap, Bot } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-400 hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-white" />
            <h1 className="text-5xl font-bold doto-title">Privacy Policy</h1>
          </div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            This privacy policy explains how Fusion Mail Chrome Extension collects, uses, and protects your information when you use our Gmail productivity extension.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Extension Notice */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Chrome className="w-6 h-6 text-white" />
              <h3 className="text-xl font-semibold text-white">Chrome Extension Privacy Notice</h3>
            </div>
            <p className="text-gray-300">
              This privacy policy specifically covers the Fusion Mail Chrome Extension. The extension enhances your Gmail experience with AI-powered email summaries, automatic OTP detection and autofill, and streamlined multi-account management.
            </p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <a href="#information-we-collect" className="text-gray-400 hover:text-white transition-colors">1. Information We Collect</a>
              <a href="#chrome-permissions" className="text-gray-400 hover:text-white transition-colors">2. Chrome Extension Permissions</a>
              <a href="#email-processing" className="text-gray-400 hover:text-white transition-colors">3. Email Data Processing</a>
              <a href="#ai-services" className="text-gray-400 hover:text-white transition-colors">4. AI Services & Third Parties</a>
              <a href="#data-storage" className="text-gray-400 hover:text-white transition-colors">5. Data Storage</a>
              <a href="#otp-functionality" className="text-gray-400 hover:text-white transition-colors">6. OTP Functionality</a>
              <a href="#data-security" className="text-gray-400 hover:text-white transition-colors">7. Data Security</a>
              <a href="#your-rights" className="text-gray-400 hover:text-white transition-colors">8. Your Rights</a>
              <a href="#data-retention" className="text-gray-400 hover:text-white transition-colors">9. Data Retention</a>
              <a href="#changes" className="text-gray-400 hover:text-white transition-colors">10. Changes to Policy</a>
              <a href="#contact" className="text-gray-400 hover:text-white transition-colors">11. Contact Us</a>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Section 1 */}
          <section id="information-we-collect" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-white" />
              <h2 className="text-3xl font-bold">1. Information We Collect</h2>
            </div>
            
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Email addresses:</strong> Your Gmail account email addresses for account management</li>
                  <li><strong>Profile information:</strong> Name and profile picture from your Google account</li>
                  <li><strong>Authentication data:</strong> OAuth tokens to access your Gmail account</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Email Content</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Email messages:</strong> Subject lines, content, and snippets for AI summarization</li>
                  <li><strong>Email metadata:</strong> Sender, recipient, timestamps, and labels</li>
                  <li><strong>OTP codes:</strong> One-time passwords detected in email content for autofill</li>
                  <li><strong>Email threads:</strong> Conversation context for AI chat functionality</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Usage Data</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Feature usage:</strong> Which features you use and how often</li>
                  <li><strong>Subscription status:</strong> Whether you have an active paid subscription</li>
                  <li><strong>Usage limits:</strong> Tracking for free tier limitations</li>
                  <li><strong>Extension settings:</strong> Your preferences and configuration</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="chrome-permissions" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Chrome className="w-6 h-6 text-white" />
              <h2 className="text-3xl font-bold">2. Chrome Extension Permissions</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>Our extension requires the following Chrome permissions:</p>
              
              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">identity</h4>
                  <p>Used for Google OAuth2 authentication to securely access your Gmail account without storing passwords.</p>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">storage</h4>
                  <p>Stores email summaries, account information, user preferences, and subscription data locally in your browser.</p>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">activeTab</h4>
                  <p>Communicates with the current tab to detect OTP input fields and automatically fill detected OTP codes.</p>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">clipboardWrite</h4>
                  <p>Copies detected OTP codes to your clipboard when autofill is not possible.</p>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">notifications</h4>
                  <p>Shows notifications when OTP codes are detected, copied, or successfully autofilled.</p>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">Host Permissions</h4>
                  <p>Access to mail.google.com, accounts.google.com, and googleapis.com for Gmail functionality and authentication.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="email-processing" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-white" />
              <h2 className="text-3xl font-bold">3. Email Data Processing</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                <p className="text-gray-200">
                  <strong>Important:</strong> We process your email data to provide AI summaries, OTP detection, and enhanced Gmail functionality. Here's exactly how we handle your emails:
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Local Processing</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>OTP detection and extraction happens locally in your browser</li>
                    <li>Email caching and organization is stored locally</li>
                    <li>Account management and preferences are stored locally</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">AI Processing</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Email content is sent to DeepSeek AI for summarization</li>
                    <li>Only email subject and snippet (first few lines) are processed</li>
                    <li>AI summaries are cached locally to avoid reprocessing</li>
                    <li>No email content is permanently stored by AI service</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Read-Only Access</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>We only read your emails, never send, modify, or delete them</li>
                    <li>No access to email drafts or sent items unless explicitly requested</li>
                    <li>Gmail labels and organization features are read-only</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="ai-services" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Bot className="w-6 h-6 text-white" />
              <h2 className="text-3xl font-bold">4. AI Services & Third Parties</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <div>
                <h4 className="font-semibold text-white mb-2">DeepSeek AI</h4>
                <p className="mb-2">We use DeepSeek AI for email summarization:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Only email subject and snippet are sent for processing</li>
                  <li>Data is transmitted securely via HTTPS</li>
                  <li>No personal identifiers are included in AI requests</li>
                  <li>AI responses are cached locally to minimize API calls</li>
                  <li>DeepSeek processes data according to their privacy policy</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Google APIs</h4>
                <p className="mb-2">We use Google's official APIs for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Gmail API for reading emails and managing labels</li>
                  <li>Google OAuth2 for secure authentication</li>
                  <li>Google Identity API for profile information</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Razorpay (Payment Processing)</h4>
                <p className="mb-2">For subscription payments:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Handles all payment transactions securely</li>
                  <li>We never store credit card information</li>
                  <li>Payment data is processed according to Razorpay's privacy policy</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="data-storage" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-white" />
              <h2 className="text-3xl font-bold">5. Data Storage</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <div>
                <h4 className="font-semibold text-white mb-2">Local Storage (Chrome Extension)</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>OAuth tokens:</strong> Encrypted access tokens for Gmail API</li>
                  <li><strong>Email summaries:</strong> AI-generated summaries cached locally</li>
                  <li><strong>Account information:</strong> Email addresses and profile data</li>
                  <li><strong>User preferences:</strong> Settings and configuration</li>
                  <li><strong>Usage tracking:</strong> Feature usage for free tier limits</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Server Storage (Subscription Service)</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>User accounts:</strong> Email, encrypted password, subscription status</li>
                  <li><strong>Payment records:</strong> Transaction history and billing information</li>
                  <li><strong>Usage analytics:</strong> Anonymized feature usage statistics</li>
                </ul>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                <p className="text-gray-200">
                  <strong>Privacy First:</strong> Most data is stored locally in your browser. We only store essential account and billing information on our servers.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="otp-functionality" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-white" />
              <h2 className="text-3xl font-bold">6. OTP Functionality</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>Our OTP (One-Time Password) feature works as follows:</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">OTP Detection</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Scans email content for common OTP patterns (6-digit codes, etc.)</li>
                    <li>Uses regular expressions to identify verification codes</li>
                    <li>Processes emails locally without sending OTP data to external servers</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Autofill Process</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Detects OTP input fields on web pages</li>
                    <li>Automatically fills detected OTP codes when possible</li>
                    <li>Falls back to clipboard copying if autofill fails</li>
                    <li>Shows notifications to keep you informed</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Security Measures</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>OTP codes are only kept in memory for 2 minutes</li>
                    <li>No permanent storage of OTP codes</li>
                    <li>Only works with the active tab for security</li>
                    <li>User can disable OTP functionality at any time</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section id="data-security" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-white" />
              <h2 className="text-3xl font-bold">7. Data Security</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>We implement comprehensive security measures:</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Encryption</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>All data transmission uses HTTPS/TLS encryption</li>
                    <li>OAuth tokens are encrypted in local storage</li>
                    <li>Server data is encrypted at rest</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Access Controls</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>OAuth2 authentication with Google</li>
                    <li>Minimal permission requests</li>
                    <li>Regular security audits and updates</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Data Minimization</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Only collect data necessary for functionality</li>
                    <li>Process data locally when possible</li>
                    <li>Regular cleanup of cached data</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section id="your-rights" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6 text-white" />
              <h2 className="text-3xl font-bold">8. Your Rights</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>You have complete control over your data:</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Access and Control</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Revoke access:</strong> Remove Gmail permissions at any time through Google Account settings</li>
                    <li><strong>Delete data:</strong> Uninstall the extension to remove all local data</li>
                    <li><strong>Export data:</strong> Request a copy of your stored data</li>
                    <li><strong>Modify settings:</strong> Control which features are enabled</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Data Requests</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Request deletion of server-stored account data</li>
                    <li>Request information about what data we have</li>
                    <li>Object to specific data processing activities</li>
                    <li>Withdraw consent for optional features</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                <p className="text-gray-200">
                  <strong>Easy Opt-Out:</strong> Simply uninstall the extension or revoke Gmail permissions in your Google Account to stop all data processing.
                </p>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section id="data-retention" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-white" />
              <h2 className="text-3xl font-bold">9. Data Retention</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>We retain different types of data for specific periods:</p>
              
              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">Local Data (Chrome Extension)</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Email summaries:</strong> Until you clear browser data or uninstall</li>
                    <li><strong>OAuth tokens:</strong> Until you revoke access or uninstall</li>
                    <li><strong>OTP codes:</strong> Maximum 2 minutes in memory only</li>
                    <li><strong>Cache data:</strong> Automatically cleaned up periodically</li>
                  </ul>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">Server Data</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Account information:</strong> Until you delete your account</li>
                    <li><strong>Payment records:</strong> 7 years for legal compliance</li>
                    <li><strong>Usage analytics:</strong> Anonymized after 1 year</li>
                    <li><strong>Support tickets:</strong> 2 years for service improvement</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 10 */}
          <section id="changes" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-white" />
              <h2 className="text-3xl font-bold">10. Changes to This Policy</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We may update this privacy policy to reflect changes in our practices or legal requirements. 
                When we make material changes, we will:
              </p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Update the "Last updated" date at the top of this policy</li>
                <li>Notify users through the extension interface</li>
                <li>Send email notifications for significant changes</li>
                <li>Provide a summary of changes when possible</li>
              </ul>
              
              <p>
                Continued use of the extension after changes become effective constitutes acceptance 
                of the updated privacy policy.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section id="contact" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-white" />
              <h2 className="text-3xl font-bold">11. Contact Us</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>For questions about this privacy policy or our data practices:</p>
              
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <div className="space-y-2">
                  <p><strong>Privacy Questions:</strong> privacy@fusionmail.com</p>
                  <p><strong>General Support:</strong> sudhanshuk1140@gmail.com</p>
                  <p><strong>Website:</strong> https://fusionmail.com</p>
                  <p><strong>Chrome Web Store:</strong> Search for "Fusion Mail" in Chrome Web Store</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                We respond to privacy inquiries within 30 days. For urgent security concerns, 
                please mark your email as "URGENT - SECURITY".
              </p>
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 rounded-2xl bg-gray-900/50 border border-gray-700">
          <h2 className="text-3xl font-bold mb-4">Transparent Privacy Practices</h2>
          <p className="text-gray-400 text-lg mb-6 max-w-3xl mx-auto">
            We believe in transparency about how we handle your data. Our Chrome extension is designed 
            with privacy in mind, processing most data locally and only using external services when necessary 
            for core functionality.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200">
              <Mail className="w-4 h-4 mr-2" />
              Contact Privacy Team
            </Button>
            <Link href="/">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 