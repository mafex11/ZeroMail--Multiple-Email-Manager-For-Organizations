'use client'
import React from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Github, Linkedin, Twitter, Youtube } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-700/50 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
             
              <span className="doto-title text-xl font-bold text-white">Fusion Mail</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your one-stop solution for all your mail needs. Manage multiple accounts, get AI assistance, and automate your email workflow.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Mail className="h-4 w-4" />
                <span>sudhanshuk1140@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <MapPin className="h-4 w-4" />
                <span>Available Worldwide</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Mail Summarizer
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-gray-400 hover:text-white transition-colors text-sm">
                  AI Email Agent
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Autofill OTP
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Multiple Account Management
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Easy Notifications
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#contact-form" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Legal & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Support Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/downloads" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Downloads
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-zinc-700/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © 2025 Fusion Mail. All rights reserved.
            </div>

            {/* Social Media Links */}
            <div className="flex items-center space-x-4">
              <Link 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>

            {/* Back to Top */}
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-gray-400 hover:text-white transition-colors text-sm hover:underline"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 