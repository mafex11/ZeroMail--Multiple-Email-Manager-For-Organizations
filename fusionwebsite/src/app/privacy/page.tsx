"use client";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Database, CreditCard, Mail, Chrome, Zap, Bot, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function PrivacyPolicyPage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sections = [
    {
      id: "information-we-collect",
      title: "Information We Collect",
      icon: Database,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-white mb-2">Personal Information</h4>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300">
              <li>Email addresses from your Gmail account</li>
              <li>Profile information (name, picture) from Google</li>
              <li>OAuth tokens for Gmail access</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Email Content</h4>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300">
              <li>Email subject lines and snippets for AI summarization</li>
              <li>OTP codes detected in emails for autofill</li>
              <li>Email metadata (sender, timestamps, labels)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Usage Data</h4>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300">
              <li>Feature usage and subscription status</li>
              <li>Extension settings and preferences</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "chrome-permissions",
      title: "Chrome Extension Permissions",
      icon: Chrome,
      content: (
        <div className="space-y-3">
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <h4 className="font-semibold text-white mb-1">identity</h4>
            <p className="text-gray-300 text-sm">Google OAuth2 authentication</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <h4 className="font-semibold text-white mb-1">storage</h4>
            <p className="text-gray-300 text-sm">Local storage for summaries and preferences</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <h4 className="font-semibold text-white mb-1">activeTab</h4>
            <p className="text-gray-300 text-sm">OTP autofill functionality</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <h4 className="font-semibold text-white mb-1">clipboardWrite</h4>
            <p className="text-gray-300 text-sm">Copy OTP codes to clipboard</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <h4 className="font-semibold text-white mb-1">notifications</h4>
            <p className="text-gray-300 text-sm">OTP detection notifications</p>
          </div>
        </div>
      )
    },
    {
      id: "email-processing",
      title: "How We Process Your Emails",
      icon: Mail,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
            <p className="text-gray-200 text-sm">
              <strong>Important:</strong> We only read your emails, never send, modify, or delete them.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Local Processing</h4>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300 text-sm">
              <li>OTP detection happens locally in your browser</li>
              <li>Email caching and organization stored locally</li>
              <li>Account preferences stored locally</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">AI Processing</h4>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300 text-sm">
              <li>Only email subject and snippet sent to DeepSeek AI</li>
              <li>AI summaries cached locally to avoid reprocessing</li>
              <li>No permanent storage by AI service</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "data-storage",
      title: "Data Storage & Security",
      icon: Lock,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-white mb-2">Local Storage (Your Browser)</h4>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300 text-sm">
              <li>OAuth tokens (encrypted)</li>
              <li>Email summaries and account info</li>
              <li>User preferences and settings</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Server Storage (Minimal)</h4>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300 text-sm">
              <li>Account email and subscription status</li>
              <li>Payment records (handled by Razorpay)</li>
              <li>Anonymized usage analytics</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Security Measures</h4>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300 text-sm">
              <li>All data transmission uses HTTPS/TLS encryption</li>
              <li>OAuth tokens encrypted in local storage</li>
              <li>Regular security audits and updates</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "otp-functionality",
      title: "OTP Functionality",
      icon: Zap,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-white mb-2">How It Works</h4>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300 text-sm">
              <li>Scans email content for OTP patterns locally</li>
              <li>Detects OTP input fields on web pages</li>
              <li>Automatically fills or copies OTP codes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Security</h4>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300 text-sm">
              <li>OTP codes kept in memory for maximum 2 minutes</li>
              <li>No permanent storage of OTP codes</li>
              <li>Only works with active tab for security</li>
              <li>Can be disabled at any time</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "your-rights",
      title: "Your Rights & Control",
      icon: Eye,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
            <p className="text-gray-200 text-sm">
              <strong>Easy Opt-Out:</strong> Simply uninstall the extension or revoke Gmail permissions to stop all data processing.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">You Can Always:</h4>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300 text-sm">
              <li>Revoke Gmail access through Google Account settings</li>
              <li>Delete all local data by uninstalling the extension</li>
              <li>Request deletion of server-stored account data</li>
              <li>Control which features are enabled</li>
              <li>Export your data or request information about stored data</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: Database,
      content: (
        <div className="space-y-3">
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <h4 className="font-semibold text-white mb-1">Local Data</h4>
            <p className="text-gray-300 text-sm">Until you clear browser data or uninstall extension</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <h4 className="font-semibold text-white mb-1">OTP Codes</h4>
            <p className="text-gray-300 text-sm">Maximum 2 minutes in memory only</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <h4 className="font-semibold text-white mb-1">Server Data</h4>
            <p className="text-gray-300 text-sm">Account info until deletion, payment records 7 years (legal requirement)</p>
          </div>
        </div>
      )
    },
    {
      id: "third-parties",
      title: "Third-Party Services",
      icon: Bot,
      content: (
        <div className="space-y-3">
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <h4 className="font-semibold text-white mb-1">DeepSeek AI</h4>
            <p className="text-gray-300 text-sm">Email summarization (subject + snippet only)</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <h4 className="font-semibold text-white mb-1">Google APIs</h4>
            <p className="text-gray-300 text-sm">Gmail API, OAuth2, Identity API</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <h4 className="font-semibold text-white mb-1">Razorpay</h4>
            <p className="text-gray-300 text-sm">Secure payment processing (we never store card info)</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-400 hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* <Shield className="w-8 h-8 text-white" /> */}
            <h1 className="text-5xl font-bold doto-title">Privacy Policy</h1>
          </div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Simple, transparent privacy practices for Fusion Mail Chrome Extension
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {/* Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} */}
          </p>
        </div>

        {/* Quick Summary */}
        <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Most data processed locally in your browser</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-400" />
              <span>We never store your passwords or full emails</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-400" />
              <span>Read-only access to your Gmail</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span>OTP codes kept in memory for 2 minutes max</span>
            </div>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <Collapsible key={section.id} open={openSections[section.id]} onOpenChange={() => toggleSection(section.id)}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-6 h-auto bg-gray-900/30 hover:bg-gray-800/50 border border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <section.icon className="w-5 h-5 text-white" />
                    <span className="text-lg font-semibold text-white">{section.title}</span>
                  </div>
                  {openSections[section.id] ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 pb-6 pt-2">
                {section.content}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Contact Us</h2>
          </div>
          <div className="space-y-2 text-gray-300">
            <p><strong>Privacy Questions:</strong> privacy@fusionmail.com</p>
            <p><strong>General Support:</strong> sudhanshuk1140@gmail.com</p>
            <p><strong>Website:</strong> https://fusionmail.com</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            We respond to privacy inquiries within 30 days.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 p-8 rounded-2xl bg-gray-900/50 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Privacy-First Design</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            We process most data locally in your browser and only use external services when necessary for core functionality.
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