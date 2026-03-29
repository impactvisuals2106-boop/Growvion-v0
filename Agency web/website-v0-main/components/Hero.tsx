'use client'

import { useEffect, useRef } from 'react'

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (heroRef.current) {
      heroRef.current.style.opacity = '0'
      heroRef.current.style.transform = 'translateY(20px)'
      heroRef.current.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement
              target.style.opacity = '1'
              target.style.transform = 'translateY(0)'
            }
          })
        },
        { threshold: 0.1 }
      )

      observer.observe(heroRef.current)

      return () => observer.disconnect()
    }
  }, [])

  return (
    <section className="hero" id="home" ref={heroRef}>
      <div className="container hero-content">
        <h1>
          We Turn Attention Into <br />
          <span className="text-gradient">Measurable Growth</span>
        </h1>
        <p>
          Your growth partner for creative storytelling, data-driven marketing, and high-impact
          media production.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <a href="#contact" className="cta-btn" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            Start Your Impact
          </a>
        </div>
      </div>
    </section>
  )
}


