"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Database, CreditCard, Mail } from "lucide-react";

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
            <h1 className="text-4xl font-bold doto-navbar">Privacy Policy</h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Table of Contents */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-white">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <a href="#information-we-collect" className="text-gray-400 hover:text-white transition-colors">1. Information We Collect</a>
              <a href="#how-we-use-information" className="text-gray-400 hover:text-white transition-colors">2. How We Use Information</a>
              <a href="#email-access" className="text-gray-400 hover:text-white transition-colors">3. Email Access & Processing</a>
              <a href="#payment-information" className="text-gray-400 hover:text-white transition-colors">4. Payment Information</a>
              <a href="#data-security" className="text-gray-400 hover:text-white transition-colors">5. Data Security</a>
              <a href="#data-sharing" className="text-gray-400 hover:text-white transition-colors">6. Data Sharing</a>
              <a href="#your-rights" className="text-gray-400 hover:text-white transition-colors">7. Your Rights</a>
              <a href="#data-retention" className="text-gray-400 hover:text-white transition-colors">8. Data Retention</a>
              <a href="#cookies" className="text-gray-400 hover:text-white transition-colors">9. Cookies & Tracking</a>
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
              <Database className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold">1. Information We Collect</h2>
            </div>
            
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Account Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Name and email address when you create an account</li>
                  <li>Password (encrypted and never stored in plain text)</li>
                  <li>Account preferences and settings</li>
                  <li>Subscription plan and payment history</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Email Data</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Email content for AI processing and summarization</li>
                  <li>Email metadata (sender, recipient, timestamps)</li>
                  <li>OTP codes for automatic detection and filling</li>
                  <li>Email attachments when necessary for processing</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Usage Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Feature usage patterns and analytics</li>
                  <li>AI chat queries and interactions</li>
                  <li>Browser type and operating system</li>
                  <li>IP address and general location</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="how-we-use-information" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Provide our services:</strong> Email management, AI chat, OTP detection, and summaries</li>
                <li><strong>Process payments:</strong> Handle subscriptions and billing through secure payment processors</li>
                <li><strong>Improve our services:</strong> Analyze usage patterns to enhance features and performance</li>
                <li><strong>Customer support:</strong> Respond to inquiries and provide technical assistance</li>
                <li><strong>Security:</strong> Protect against fraud, abuse, and unauthorized access</li>
                <li><strong>Legal compliance:</strong> Meet regulatory requirements and legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section id="email-access" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">3. Email Access & Processing</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                <p className="text-yellow-200">
                  <strong>Important:</strong> Fusion Mail requires access to your email accounts to provide its services. 
                  Here's how we handle your email data:
                </p>
              </div>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Read-only access:</strong> We only read your emails, never send or delete them</li>
                <li><strong>Local processing:</strong> Email content is processed locally when possible</li>
                <li><strong>Temporary storage:</strong> Email data is temporarily cached for AI processing</li>
                <li><strong>No human access:</strong> Our staff never manually read your personal emails</li>
                <li><strong>Encryption:</strong> All email data is encrypted in transit and at rest</li>
                <li><strong>User control:</strong> You can revoke email access at any time</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section id="payment-information" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-bold">4. Payment Information</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>For payment processing, we work with trusted third-party providers:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Razorpay:</strong> Handles all payment transactions securely</li>
                <li><strong>No card storage:</strong> We never store your credit card information</li>
                <li><strong>Transaction records:</strong> We keep records of payments for billing and support</li>
                <li><strong>Refund processing:</strong> Payment data is retained for refund and dispute resolution</li>
                <li><strong>PCI compliance:</strong> All payment processing meets industry security standards</li>
              </ul>
              
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <p className="text-blue-200">
                  Your payment information is processed according to Razorpay's privacy policy and 
                  industry-standard security practices.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="data-security" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-red-400" />
              <h2 className="text-2xl font-bold">5. Data Security</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>We implement multiple layers of security to protect your data:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS) and at rest (AES-256)</li>
                <li><strong>Access controls:</strong> Strict employee access controls and authentication</li>
                <li><strong>Regular audits:</strong> Security assessments and vulnerability testing</li>
                <li><strong>Secure infrastructure:</strong> Industry-standard hosting with security monitoring</li>
                <li><strong>Data backups:</strong> Regular encrypted backups for data recovery</li>
                <li><strong>Incident response:</strong> Procedures for handling security incidents</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section id="data-sharing" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-teal-400" />
              <h2 className="text-2xl font-bold">6. Data Sharing</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>We do not sell your personal information. We may share data only in these limited circumstances:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service providers:</strong> Trusted partners who help us operate our services</li>
                <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                <li><strong>With consent:</strong> When you explicitly authorize us to share information</li>
              </ul>
              
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                <p className="text-green-200">
                  <strong>We never:</strong> Sell your data to advertisers, share email content with third parties, 
                  or use your data for marketing by other companies.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section id="your-rights" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold">7. Your Rights</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>You have the following rights regarding your personal data:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a readable format</li>
                <li><strong>Withdrawal:</strong> Revoke consent for data processing</li>
                <li><strong>Objection:</strong> Object to certain types of data processing</li>
              </ul>
              
              <p>To exercise these rights, please contact us at privacy@fusionmail.com</p>
            </div>
          </section>

          {/* Section 8 */}
          <section id="data-retention" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold">8. Data Retention</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>We retain your data for different periods based on its type and purpose:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Account data:</strong> Until you delete your account</li>
                <li><strong>Email content:</strong> Temporarily cached, then deleted after processing</li>
                <li><strong>Payment records:</strong> 7 years for tax and legal compliance</li>
                <li><strong>Usage analytics:</strong> Anonymized after 2 years</li>
                <li><strong>Support tickets:</strong> 3 years for quality improvement</li>
              </ul>
            </div>
          </section>

          {/* Section 9 */}
          <section id="cookies" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6 text-pink-400" />
              <h2 className="text-2xl font-bold">9. Cookies & Tracking</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>We use cookies and similar technologies for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Authentication:</strong> Keep you logged in to your account</li>
                <li><strong>Preferences:</strong> Remember your settings and preferences</li>
                <li><strong>Analytics:</strong> Understand how our service is used</li>
                <li><strong>Security:</strong> Detect and prevent fraud or abuse</li>
              </ul>
              
              <p>You can control cookies through your browser settings, though some features may not work properly if disabled.</p>
            </div>
          </section>

          {/* Section 10 */}
          <section id="changes" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold">10. Changes to This Policy</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We may update this privacy policy from time to time. When we make significant changes, 
                we will notify you by email and/or through our service. The "Last updated" date at the 
                top of this policy indicates when it was last revised.
              </p>
              
              <p>
                Your continued use of our service after changes become effective constitutes acceptance 
                of the new privacy policy.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section id="contact" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-bold">11. Contact Us</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>If you have questions about this privacy policy or our data practices, please contact us:</p>
              
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <div className="space-y-2">
                  <p><strong>Email:</strong> privacy@fusionmail.com</p>
                  <p><strong>Support:</strong> sudhanshuk1140@gmail.com</p>
                  <p><strong>Website:</strong> https://fusionmail.com</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                We will respond to your inquiry within 30 days of receipt.
              </p>
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 rounded-2xl bg-gray-900/50 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Questions About Privacy?</h2>
          <p className="text-gray-400 text-lg mb-6 max-w-2xl mx-auto">
            We're committed to transparency and protecting your privacy. 
            Contact us if you have any questions or concerns.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200">
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
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