import { motion } from 'framer-motion';
import { X, Users, Camera, ArrowUp } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <motion.a 
              href="#" 
              className="logo logo-footer"
              data-track="Footer: Brand Logo"
              whileHover={{ scale: 1.05 }}
            >
              <img src="/Growvex-logo-white.png" alt="Growvex" className="logo-img" />
            </motion.a>
            <p className="footer-description">
              A forward-thinking umbrella startup launching the next generation of innovative services. We redefine standards through excellence and vision.
            </p>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4>Services</h4>
              <ul>
                <li><a href="#" data-track="Footer Link: Service - Impact Visuals">Impact Visuals</a></li>
                <li><a href="#" data-track="Footer Link: Service - Project Nexus">Project Nexus</a></li>
                <li><a href="#" data-track="Footer Link: Service - Vanguard Suite">Vanguard Suite</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#home" data-track="Footer Link: Company - About Us">About Us</a></li>
                <li><a href="#contact" data-track="Footer Link: Company - Contact">Contact</a></li>
                <li><a href="#" data-track="Footer Link: Company - Careers">Careers</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="#" data-track="Footer Link: Legal - Privacy Policy">Privacy Policy</a></li>
                <li><a href="#" data-track="Footer Link: Legal - Terms">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            <p>&copy; {new Date().getFullYear()} Growvex. All rights reserved.</p>
          </div>
          
          <div className="social-links">
            <motion.a href="#" data-track="Footer Social: Twitter X" whileHover={{ y: -5, color: 'hsl(var(--accent-1))' }} aria-label="Twitter">
              <X size={20} />
            </motion.a>
            <motion.a href="#" data-track="Footer Social: LinkedIn" whileHover={{ y: -5, color: 'hsl(var(--accent-2))' }} aria-label="LinkedIn">
              <Users size={20} />
            </motion.a>
            <motion.a 
              href="https://www.instagram.com/growvex.india?igsh=MWVxOTk3azh6cXZ0YQ==" 
              target="_blank" 
              rel="noopener noreferrer" 
              data-track="Footer Social: Instagram"
              whileHover={{ y: -5, color: 'hsl(var(--accent-3))' }} 
              aria-label="Instagram"
            >
              <Camera size={20} />
            </motion.a>
          </div>

          <motion.button 
            className="scroll-top-btn"
            data-track="Footer Interaction: Scroll to Top"
            onClick={scrollToTop}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp size={20} />
          </motion.button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
