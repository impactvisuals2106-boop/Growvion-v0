'use client'

import { useState, FormEvent } from 'react'

export default function Contact() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const data = {
      ...formData,
      date: new Date().toISOString(),
    }

    try {
      // Send email via API route
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message')
      }

      // Data is now saved to Supabase via the API route
      // No need for localStorage anymore

      // Show success message
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)

      // Reset form
      setFormData({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.')
      console.error('Error submitting form:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <section id="contact">
      <div className="container">
        <div className="contact-container">
          <div className="section-title">
            <span>Get In Touch</span>
            <h2>Ready to Scale?</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Contact Number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <textarea
                name="message"
                rows={5}
                placeholder="Tell us about your Business"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Message'}
            </button>
            {error && (
              <div
                style={{
                  display: 'flex',
                  marginTop: '1rem',
                  color: '#ff4757',
                  fontWeight: 600,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}
            {showSuccess && (
              <div
                id="formSuccess"
                style={{
                  display: 'flex',
                  marginTop: '1rem',
                  color: '#2ed573',
                  fontWeight: 600,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <i className="fas fa-check-circle"></i> Message sent successfully! We&apos;ll get back to you soon.
              </div>
            )}
          </form>

          <div className="contact-info">
            <div className="info-item">
              <i className="fas fa-envelope" style={{ color: 'var(--accent-primary)' }}></i>
              <a href="mailto:impactvisuals2106@gmail.com">impactvisuals2106@gmail.com</a>
            </div>
            <div className="info-item">
              <i className="fab fa-whatsapp" style={{ color: '#25D366' }}></i>
              <a href="#">+91 9515251305</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

