'use client'

import { useEffect, useRef } from 'react'

export default function About() {
  const aboutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (aboutRef.current) {
      const elements = aboutRef.current.querySelectorAll('.about-grid > div, .section-title')
      elements.forEach((el) => {
        ;(el as HTMLElement).style.opacity = '0'
        ;(el as HTMLElement).style.transform = 'translateY(20px)'
        ;(el as HTMLElement).style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'
      })

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              ;(entry.target as HTMLElement).style.opacity = '1'
              ;(entry.target as HTMLElement).style.transform = 'translateY(0)'
            }
          })
        },
        { threshold: 0.1 }
      )

      elements.forEach((el) => observer.observe(el))

      return () => observer.disconnect()
    }
  }, [])

  return (
    <section id="about">
      <div className="container" ref={aboutRef}>
        <div className="about-grid">
          <div>
            <div className="section-title" style={{ textAlign: 'left' }}>
              <span>Who We Are</span>
              <h2 className="text-gradient">Results-Driven Creative & Marketing Team</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              We are a digital marketing and media production team helping businesses that are ready
              to scale. We don&apos;t just make content; we build assets that drive engagement and
              revenue.
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              Our approach is simple: understand your business, create impactful content, and
              distribute it strategically to the right audience.
            </p>
          </div>
          <div className="vision-card">
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Our Mission</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              To act as a true growth partner, delivering consistent value through cinematic content,
              precision SEO, and performance-based campaigns.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}




