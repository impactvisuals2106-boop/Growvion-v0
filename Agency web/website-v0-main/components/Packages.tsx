'use client'

import { useEffect, useRef } from 'react'

interface PackageFeature {
  text: string
  bold?: boolean
}

interface Package {
  name: string
  subtitle: string
  price: string
  period: string
  description: string
  features: PackageFeature[]
  buttonText: string
  popular: boolean
}

const packages: Package[] = [
  {
    name: 'STARTER',
    subtitle: 'Visibility Package',
    price: '₹14,999',
    period: '/mo',
    description: 'Best for new brands & local businesses',
    features: [
      { text: '12 High-Quality Posts/mo' },
      { text: '6 Reels/mo', bold: true },
      { text: ' (Reach Strategy)' },
      { text: 'Basic SEO & GEO Setup' },
      { text: 'Hashtag & Caption Optimization' },
      { text: 'Monthly Performance Report' },
    ],
    buttonText: 'Get Started',
    popular: false,
  },
  {
    name: 'GROWTH',
    subtitle: 'Performance Package',
    price: '₹39,999',
    period: '/mo',
    description: 'Best for brands ready to grow & generate leads',
    features: [
      { text: '20 Posts + ' },
      { text: '12-16 Reels/mo', bold: true },
      { text: 'Advanced SEO + Local Keywords' },
      { text: 'Ads Management', bold: true },
      { text: ' (Meta/Google)' },
      { text: 'Campaign Planning & Reporting' },
    ],
    buttonText: 'Get Started',
    popular: true,
  },
  {
    name: 'DOMINATION',
    subtitle: 'Scale & Authority',
    price: 'Custom',
    period: ' (₹70K+)',
    description: 'For brands serious about total market leadership',
    features: [
      { text: 'Daily Content', bold: true },
      { text: ' (20-30 Reels)' },
      { text: 'Full SEO (Local + National + Blog)' },
      { text: 'Advanced Full-Funnel Ads' },
      { text: 'Dedicated Account Manager' },
    ],
    buttonText: 'Contact Us',
    popular: false,
  },
]

export default function Packages() {
  const packagesRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (packagesRef.current) {
      const cards = packagesRef.current.querySelectorAll('.service-card')
      cards.forEach((card) => {
        ;(card as HTMLElement).style.opacity = '0'
        ;(card as HTMLElement).style.transform = 'translateY(20px)'
        ;(card as HTMLElement).style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'
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

      cards.forEach((card) => observer.observe(card))

      return () => observer.disconnect()
    }
  }, [])

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section id="packages" ref={packagesRef}>
      <div className="container">
        <div className="section-title">
          <span>Pricing</span>
          <h2>Our Packages</h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              marginTop: '10px',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Designed for Maximum Reach, Leads & Growth. We focus on real growth, not fake promises.
          </p>
        </div>

        <div
          className="services-grid"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}
        >
          {packages.map((pkg, index) => (
            <div
              key={index}
              className="service-card"
              style={{
                border: pkg.popular ? '1px solid var(--accent-primary)' : '1px solid #333',
                background: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                transform: pkg.popular ? 'scale(1.02)' : 'none',
                zIndex: pkg.popular ? 2 : 1,
                boxShadow: pkg.popular ? '0 10px 40px rgba(0,112,243,0.15)' : 'none',
                position: 'relative',
              }}
            >
              {pkg.popular && (
                <div
                  style={{
                    background: 'var(--accent-primary)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    position: 'absolute',
                    top: '-12px',
                    right: '20px',
                    fontWeight: 600,
                  }}
                >
                  MOST POPULAR
                </div>
              )}
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{pkg.name}</h3>
              <span
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  marginBottom: '1rem',
                }}
              >
                {pkg.subtitle}
              </span>

              <p
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                  marginBottom: '0.5rem',
                }}
              >
                {pkg.price}
                <span
                  style={{
                    fontSize: '1rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 400,
                  }}
                >
                  {pkg.period}
                </span>
              </p>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  borderBottom: '1px solid #333',
                  paddingBottom: '1rem',
                }}
              >
                {pkg.description}
              </p>

              <div
                style={{
                  textAlign: 'left',
                  marginBottom: '1.5rem',
                  flexGrow: 1,
                }}
              >
                <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.8rem' }}>
                  To Do List:
                </h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {pkg.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      style={{
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                      }}
                    >
                      <i
                        className="fas fa-check"
                        style={{
                          color: 'var(--accent-primary)',
                          marginRight: '10px',
                          marginTop: '4px',
                        }}
                      ></i>
                      <span>{feature.bold ? <strong>{feature.text}</strong> : feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="#contact"
                className="cta-btn"
                style={{ width: '100%', display: 'block', textAlign: 'center' }}
                onClick={(e) => handleLinkClick(e, '#contact')}
              >
                {pkg.buttonText}
              </a>
            </div>
          ))}
        </div>

        <p
          style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            marginTop: '3rem',
            fontSize: '0.9rem',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <i className="fas fa-info-circle"></i> <strong>Important:</strong> Results depend on
          industry, consistency, ad budget & market competition.
        </p>
      </div>
    </section>
  )
}

