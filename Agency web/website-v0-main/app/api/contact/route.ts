import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Helper function to sanitize HTML
function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(request: NextRequest) {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Email configuration missing')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { name, email, phone, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedName = sanitizeHtml(name.trim())
    const sanitizedEmail = sanitizeHtml(email.trim())
    const sanitizedPhone = phone ? sanitizeHtml(phone.trim()) : 'Not provided'
    const sanitizedMessage = sanitizeHtml(message.trim())

    // Create transporter using Gmail SMTP
    // You'll need to set up environment variables for this
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER?.trim(), // Your Gmail address
        pass: process.env.EMAIL_PASSWORD?.trim(), // Your Gmail App Password (remove any spaces)
      },
    })

    // Verify transporter configuration
    try {
      await transporter.verify()
      console.log('Email server is ready to send messages')
    } catch (verifyError) {
      console.error('Email server verification failed:', verifyError)
      throw new Error('Email server configuration is invalid')
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'impactvisuals2106@gmail.com',
      subject: `New Contact Form Submission from ${sanitizedName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0070f3;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${sanitizedName}</p>
            <p><strong>Email:</strong> ${sanitizedEmail}</p>
            <p><strong>Phone:</strong> ${sanitizedPhone}</p>
            <p><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px; white-space: pre-wrap;">
              ${sanitizedMessage.replace(/\n/g, '<br>')}
            </p>
          </div>
          <p style="color: #666; font-size: 12px;">
            This email was sent from the Impact Visuals website contact form.
          </p>
        </div>
      `,
      replyTo: email, // Allow replying directly to the sender
    }

    // Send email
    await transporter.sendMail(mailOptions)

    // Save to Supabase database
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error: dbError } = await supabase
        .from('leads')
        .insert([
          {
            name: sanitizedName,
            email: sanitizedEmail,
            phone: sanitizedPhone !== 'Not provided' ? sanitizedPhone : null,
            message: sanitizedMessage,
          },
        ])

      if (dbError) {
        console.error('Error saving to database:', dbError)
        // Don't fail the request if DB save fails, email was sent successfully
      }
    } catch (dbErr) {
      console.error('Database save error:', dbErr)
      // Continue - email was sent successfully
    }

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error sending email:', error)
    
    // Provide more detailed error messages
    let errorMessage = 'Failed to send email'
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Please check your Gmail App Password.'
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Connection failed. Please check your internet connection.'
    } else if (error.response) {
      errorMessage = `Email service error: ${error.response}`
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

