'use client'

import { useEffect, useRef } from 'react'

const teamMembers = [
  { name: 'Veera Babu', role: 'Founder', image: '/assets/veera_babu.jpeg', hasImage: true },
  { name: 'Thanmai', role: 'Marketing Lead', image: '/assets/Thanmai.jpeg', hasImage: true },
  { name: 'Vitesh', role: 'Co-Founder', image: '/assets/vitesh.jpeg', hasImage: true },
  { name: 'Vaseem', role: 'Dop Lead', image: '', hasImage: false },
  { name: 'Agasthya', role: 'Editing Lead', image: '/assets/Agasthya.jpeg', hasImage: true },
  { name: 'Akshitha', role: 'Designing Lead', image: '/assets/akshitha.jpg', hasImage: true },
  { name: 'Kowshik', role: 'Manager', image: '/assets/kowshik.jpeg', hasImage: true },
  { name: 'Dikshitha', role: 'Member', image: '', hasImage: false },
]

export default function Team() {
  const teamRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (teamRef.current) {
      const cards = teamRef.current.querySelectorAll('.team-card')
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
    <section id="team" ref={teamRef}>
      <div className="container">
        <div className="section-title">
          <span>The Team</span>
          <h2>Meet the Creators</h2>
        </div>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              {member.hasImage ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="team-photo"
                  style={
                    member.name === 'Veera Babu'
                      ? { objectPosition: 'center 30%', filter: 'contrast(1.15) saturate(1.1)' }
                      : {}
                  }
                />
              ) : (
                <div className="team-photo"></div>
              )}
              <h3>{member.name}</h3>
              <p
                style={{
                  color: 'var(--accent-primary)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

