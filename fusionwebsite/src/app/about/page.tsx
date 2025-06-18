"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Mail, Users, Target, Heart, Zap, Shield, Globe, Award, Code, Brain, Rocket } from "lucide-react";

export default function AboutPage() {
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

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Users className="w-10 h-10 text-white" />
            <h1 className="text-5xl font-bold doto-navbar">About Fusion Mail</h1>
          </div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing email management with AI-powered tools that make your inbox work for you, 
            not against you. Founded with a mission to simplify digital communication for everyone.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Mission */}
            <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8 text-blue-400" />
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                To empower individuals and businesses with intelligent email management tools that save time, 
                reduce stress, and enhance productivity. We believe everyone deserves a smarter, more 
                organized digital communication experience.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <Rocket className="w-8 h-8 text-purple-400" />
                <h2 className="text-3xl font-bold">Our Vision</h2>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                To become the world's leading AI-powered email management platform, transforming how 
                people interact with their digital communications while maintaining the highest standards 
                of privacy and security.
              </p>
            </div>
          </div>
        </div>

        {/* Company Story */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Story</h2>
            <p className="text-xl text-gray-400">From frustration to innovation</p>
          </div>
          
          <div className="space-y-8 text-gray-300 leading-relaxed">
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-8 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">The Problem</h3>
              <p>
                Like millions of people worldwide, our founder was drowning in emails. Managing multiple accounts, 
                missing important messages, and spending hours sorting through endless promotional emails had become 
                a daily nightmare. Traditional email clients felt outdated and inefficient.
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-900/20 to-teal-900/20 rounded-lg p-8 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">The Solution</h3>
              <p>
                We envisioned an AI-powered email assistant that could understand context, summarize content, 
                and automate routine tasks. After months of development and testing, Fusion Mail was born - 
                a Chrome extension that transforms any email interface into an intelligent workspace.
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-lg p-8 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">The Future</h3>
              <p>
                Today, thousands of users rely on Fusion Mail to manage their digital communications more effectively. 
                We're continuously innovating, adding new features, and expanding our AI capabilities to serve our 
                growing community of power users and businesses.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-gray-400">What drives us every day</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="text-center p-6 rounded-xl bg-gray-900/30 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-600/20 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-gray-400">
                We constantly push the boundaries of what's possible with AI and email technology.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-900/30 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-600/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Privacy First</h3>
              <p className="text-gray-400">
                Your data security and privacy are our top priorities in everything we build.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-900/30 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-600/20 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">User-Centric</h3>
              <p className="text-gray-400">
                Every feature we develop is designed with our users' needs and feedback in mind.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-900/30 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-600/20 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Efficiency</h3>
              <p className="text-gray-400">
                We believe technology should save time and reduce complexity, not add to it.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-900/30 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-600/20 rounded-full flex items-center justify-center">
                <Globe className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Accessibility</h3>
              <p className="text-gray-400">
                Powerful email management should be available to everyone, everywhere.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-900/30 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-600/20 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Excellence</h3>
              <p className="text-gray-400">
                We strive for excellence in every line of code and every user interaction.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-400">The brilliant minds behind Fusion Mail</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Founder */}
            <div className="text-center p-8 rounded-xl bg-gray-900/50 border border-gray-700">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Code className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sudhanshu Kumar</h3>
              <p className="text-blue-400 mb-3">Founder & CEO</p>
              <p className="text-gray-400 text-sm">
                Visionary developer with a passion for AI and email automation. 
                Committed to creating tools that genuinely improve people's lives.
              </p>
            </div>

            {/* AI Team */}
            <div className="text-center p-8 rounded-xl bg-gray-900/50 border border-gray-700">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Development Team</h3>
              <p className="text-green-400 mb-3">Machine Learning Engineers</p>
              <p className="text-gray-400 text-sm">
                Specialists in natural language processing and email intelligence, 
                working to make AI more helpful and intuitive.
              </p>
            </div>

            {/* Security Team */}
            <div className="text-center p-8 rounded-xl bg-gray-900/50 border border-gray-700">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Security Team</h3>
              <p className="text-red-400 mb-3">Privacy & Security Experts</p>
              <p className="text-gray-400 text-sm">
                Dedicated to protecting user data and ensuring the highest 
                standards of privacy and security in all our products.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl text-gray-400">Numbers that matter</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-b from-blue-900/30 to-blue-900/10 border border-blue-700/30">
              <div className="text-4xl font-bold text-blue-400 mb-2">10K+</div>
              <p className="text-gray-400">Active Users</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-b from-green-900/30 to-green-900/10 border border-green-700/30">
              <div className="text-4xl font-bold text-green-400 mb-2">1M+</div>
              <p className="text-gray-400">Emails Processed</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-b from-purple-900/30 to-purple-900/10 border border-purple-700/30">
              <div className="text-4xl font-bold text-purple-400 mb-2">500K+</div>
              <p className="text-gray-400">Hours Saved</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-b from-orange-900/30 to-orange-900/10 border border-orange-700/30">
              <div className="text-4xl font-bold text-orange-400 mb-2">99.9%</div>
              <p className="text-gray-400">Uptime</p>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Built with Modern Technology</h2>
            <p className="text-xl text-gray-400">The tech stack that powers Fusion Mail</p>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-lg font-semibold text-white">Frontend</div>
                <div className="text-sm text-gray-400">React, TypeScript, Next.js</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-lg font-semibold text-white">Backend</div>
                <div className="text-sm text-gray-400">Node.js, API Routes</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-lg font-semibold text-white">Database</div>
                <div className="text-sm text-gray-400">MongoDB, Secure Storage</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-lg font-semibold text-white">AI/ML</div>
                <div className="text-sm text-gray-400">OpenAI, Custom Models</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center p-12 rounded-2xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-gray-700">
          <h2 className="text-3xl font-bold mb-4">Want to Learn More?</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            We'd love to hear from you. Whether you have questions, feedback, or just want to say hello, 
            our team is always ready to connect.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/#contact-form">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                <Mail className="w-5 h-5 mr-2" />
                Contact Us
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                Explore Features
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 