'use client'

import { useEffect, useRef } from 'react'

const services = [
  {
    icon: 'fas fa-film',
    iconColor: '#ff4757',
    title: 'Media Production',
    description: 'Professional video shoots and editing that captivate.',
    items: [
      'Professional Video Shoots',
      'Reels & Short-form Videos',
      'Product & Brand Films',
      'Motion Graphics & VFX',
    ],
  },
  {
    icon: 'fas fa-mobile-alt',
    iconColor: '#2ed573',
    title: 'Social Media',
    description: 'Building communities and engagement globally.',
    items: [
      'Content Planning & Strategy',
      'Posting & Scheduling',
      'Reels, Shorts, & TikToks',
      'Community Engagement',
    ],
  },
  {
    icon: 'fas fa-chart-line',
    iconColor: '#ffa502',
    title: 'Performance Marketing',
    description: 'Paid campaigns that drive real ROI.',
    items: ['Meta & Google Ads', 'Campaign Strategy', 'Lead Generation', 'Analytics & Reporting'],
  },
  {
    icon: 'fas fa-map-marker-alt',
    iconColor: '#1e90ff',
    title: 'SEO & Geo Marketing',
    description: 'Be found where your customers are looking.',
    items: ['Local SEO (GMB)', 'Geo-targeted Rankings', 'Map Visibility', 'Local Ads & Reach'],
  },
]

export default function Services() {
  const servicesRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (servicesRef.current) {
      const cards = servicesRef.current.querySelectorAll('.service-card')
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

  return (
    <section id="services" ref={servicesRef}>
      <div className="container">
        <div className="section-title">
          <span>What We Do</span>
          <h2>End-to-End Solutions</h2>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <span className="service-icon" style={{ color: service.iconColor }}>
                <i className={service.icon}></i>
              </span>
              <h3>{service.title}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{service.description}</p>
              <ul>
                {service.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}




