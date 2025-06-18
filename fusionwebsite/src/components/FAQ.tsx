'use client'
import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([])

  const faqData: FAQItem[] = [
    {
      question: "What is Fusion Mail and how does it work?",
      answer: "Fusion Mail is a comprehensive email management extension that helps you organize multiple email accounts, get AI-powered assistance, and automate your email workflow. It works by integrating with your existing email providers and adding powerful features like email summarization, OTP detection, and intelligent email management."
    },
    {
      question: "Which email providers does Fusion Mail support?",
      answer: "Fusion Mail supports all major email providers including Gmail, Outlook, Yahoo Mail, Apple Mail, and many others. Our extension works with any email service that supports standard email protocols, ensuring broad compatibility across different platforms."
    },
    {
      question: "How does the AI Email Agent work?",
      answer: "Our AI Email Agent uses advanced machine learning to understand your email patterns and preferences. It can automatically categorize emails, suggest responses, prioritize important messages, and even draft replies based on your writing style. The AI learns from your interactions to become more personalized over time."
    },
    {
      question: "Is my email data secure with Fusion Mail?",
      answer: "Absolutely. We take privacy and security very seriously. All your email data is encrypted both in transit and at rest. We follow industry-standard security practices and never store your email passwords. Your data remains private and is only processed locally on your device when possible."
    },
    {
      question: "How does the automatic OTP detection feature work?",
      answer: "Fusion Mail automatically scans incoming emails for one-time passwords (OTPs) and verification codes. When detected, it can automatically copy the code to your clipboard or even auto-fill it in the appropriate field, saving you time and reducing the chance of errors when entering verification codes."
    },
    {
      question: "Can I manage multiple email accounts with Fusion Mail?",
      answer: "Yes! Fusion Mail is designed to handle multiple email accounts seamlessly. You can connect accounts from different providers, view them in a unified interface, and manage all your emails from one central location. Each account maintains its own settings and preferences."
    },
    {
      question: "What browsers are supported?",
      answer: "Fusion Mail is available for all major browsers including Chrome, Firefox, Safari, and Edge. We ensure consistent functionality across all supported browsers and regularly update our extension to maintain compatibility with the latest browser versions."
    },
    {
      question: "Is there a free version available?",
      answer: "Yes, we offer a free tier that includes basic email management features, limited AI assistance, and OTP detection for up to 2 email accounts. For advanced features like unlimited accounts, full AI capabilities, and premium support, we offer affordable paid plans."
    },
    {
      question: "How do I get started with Fusion Mail?",
      answer: "Getting started is easy! Simply download the extension from your browser's extension store, create an account, and connect your email accounts. Our setup wizard will guide you through the process, and you'll be managing your emails more efficiently in just a few minutes."
    }
  ]

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="doto-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
          Got questions? We've got answers. Find everything you need to know about Fusion Mail.
        </p>
      </div>

      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div
            key={index}
            className="bg-zinc-900/50 border border-zinc-700/50 rounded-lg overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-zinc-600/50"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-zinc-800/30 transition-colors duration-200"
            >
              <span className="text-white font-semibold text-lg pr-4">
                {item.question}
              </span>
              <div className={`transition-transform duration-300 ${openItems.includes(index) ? 'rotate-180' : 'rotate-0'}`}>
                <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
            </button>
            
            <div 
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                openItems.includes(index) 
                  ? 'max-h-96 opacity-100' 
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-4">
                <div className="border-t border-zinc-700/30 pt-4">
                  <p className="text-gray-300 leading-relaxed transform transition-transform duration-300">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* <div className="text-center mt-12">
        <p className="text-gray-400 mb-4">
          Still have questions?
        </p>
        <a
          href="#contact-form"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105"
        >
          Contact Us
        </a>
      </div> */}
    </div>
  )
}

export default FAQ 