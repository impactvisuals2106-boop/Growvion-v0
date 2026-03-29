'use client'

import { useEffect, useState } from 'react'
import './Header.css'

export default function Header() {
  const [activeSection, setActiveSection] = useState('home')
  const [navLineStyle, setNavLineStyle] = useState({ width: '0px', left: '0px' })

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]')
      const headerHeight = 100

      let current = ''
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop
        if (window.scrollY >= sectionTop - headerHeight) {
          current = section.getAttribute('id') || ''
        }
      })

      if (window.scrollY < 50) {
        current = 'home'
      }

      setActiveSection(current)
      updateNavLine(current)
    }

    const updateNavLine = (section: string) => {
      const activeLink = document.querySelector(`.nav-links a[href="#${section}"]`) as HTMLElement
      const navContainer = document.querySelector('.nav-links') as HTMLElement

      if (activeLink && navContainer) {
        const linkRect = activeLink.getBoundingClientRect()
        const containerRect = navContainer.getBoundingClientRect()
        const left = linkRect.left - containerRect.left
        const width = linkRect.width

        setNavLineStyle({ width: `${width}px`, left: `${left}px` })
      } else {
        setNavLineStyle({ width: '0px', left: '0px' })
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', () => updateNavLine(activeSection))
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', () => updateNavLine(activeSection))
    }
  }, [activeSection])

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <header>
      <div className="container nav-container">
        <a href="#home" className="logo" onClick={(e) => handleLinkClick(e, '#home')}>
          IMPACT VISUALS<span style={{ color: 'var(--accent-primary)' }}>.</span>
        </a>
        <nav>
          <ul className="nav-links">
            <li>
              <a
                href="#home"
                className={activeSection === 'home' ? 'active' : ''}
                onClick={(e) => handleLinkClick(e, '#home')}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#about"
                className={activeSection === 'about' ? 'active' : ''}
                onClick={(e) => handleLinkClick(e, '#about')}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#services"
                className={activeSection === 'services' ? 'active' : ''}
                onClick={(e) => handleLinkClick(e, '#services')}
              >
                Services
              </a>
            </li>
            <li>
              <a
                href="#packages"
                className={activeSection === 'packages' ? 'active' : ''}
                onClick={(e) => handleLinkClick(e, '#packages')}
              >
                Packages
              </a>
            </li>
            <li>
              <a
                href="#team"
                className={activeSection === 'team' ? 'active' : ''}
                onClick={(e) => handleLinkClick(e, '#team')}
              >
                Team
              </a>
            </li>
            <div className="nav-active-line" style={navLineStyle}></div>
          </ul>
        </nav>
        <a href="#contact" className="cta-btn" onClick={(e) => handleLinkClick(e, '#contact')}>
          Book a Call
        </a>
        <div className="menu-toggle">
          <i className="fas fa-bars"></i>
        </div>
      </div>
    </header>
  )
}




