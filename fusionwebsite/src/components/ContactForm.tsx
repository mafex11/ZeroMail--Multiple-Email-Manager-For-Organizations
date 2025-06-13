'use client'
import React, { useState } from 'react'
import emailjs from '@emailjs/browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, User, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react'

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // EmailJS configuration from environment variables
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!

      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_email: 'sudhanshuk1140@gmail.com'
      }

      await emailjs.send(serviceId, templateId, templateParams, publicKey)
      
      setSubmitStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      console.error('EmailJS error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div id="contact-form" className="w-full max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="doto-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          Get in Touch
        </h2>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
          Have questions about Fusion Mail?  We'd love to hear from you.
        </p>
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
          Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-white/20 backdrop-blur-md shadow-2xl shadow-white/10 relative overflow-hidden">
        {/* Shiny overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full animate-shimmer"></div>
        
        <CardHeader className="relative z-10">
          <CardTitle className="text-white flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            <Mail className="h-6 w-6 text-white drop-shadow-lg" />
            Contact Us
          </CardTitle>
          <CardDescription className="text-gray-300">
            Fill out the form below and we'll get back to you within 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white flex items-center gap-2 font-semibold">
                  <User className="h-4 w-4 text-white drop-shadow-md" />
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-gradient-to-r from-black to-gray-900 border-2 border-white/30 text-white placeholder:text-gray-400 focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all duration-300 shadow-inner"
                  placeholder="Your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white flex items-center gap-2 font-semibold">
                  <Mail className="h-4 w-4 text-white drop-shadow-md" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-gradient-to-r from-black to-gray-900 border-2 border-white/30 text-white placeholder:text-gray-400 focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all duration-300 shadow-inner"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-white flex items-center gap-2 font-semibold">
                <MessageSquare className="h-4 w-4 text-white drop-shadow-md" />
                Subject
              </Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                required
                className="bg-gradient-to-r from-black to-gray-900 border-2 border-white/30 text-white placeholder:text-gray-400 focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all duration-300 shadow-inner"
                placeholder="What's this about?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-white flex items-center gap-2 font-semibold">
                <MessageSquare className="h-4 w-4 text-white drop-shadow-md" />
                Message
              </Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="bg-gradient-to-r from-black to-gray-900 border-2 border-white/30 text-white placeholder:text-gray-400 focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all duration-300 shadow-inner resize-none"
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            {submitStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-3 rounded-md">
                <CheckCircle className="h-5 w-5" />
                <span>Message sent successfully! We'll get back to you soon.</span>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-md">
                <AlertCircle className="h-5 w-5" />
                <span>Failed to send message. Please try again or email us directly.</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-black via-gray-800 to-black border-2 border-white/40 hover:border-white/60 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white drop-shadow-lg"></div>
                  <span className="relative z-10">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 drop-shadow-lg relative z-10" />
                  <span className="relative z-10">Send Message</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ContactForm 