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
              className="logo"
              whileHover={{ scale: 1.05 }}
            >
              Grow<span className="text-gradient">vion</span>
            </motion.a>
            <p className="footer-description">
              A forward-thinking umbrella startup launching the next generation of innovative services. We redefine standards through excellence and vision.
            </p>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4>Services</h4>
              <ul>
                <li><a href="#">Impact Visuals</a></li>
                <li><a href="#">Project Nexus</a></li>
                <li><a href="#">Vanguard Suite</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#home">About Us</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            <p>&copy; {new Date().getFullYear()} Growvion. All rights reserved.</p>
          </div>
          
          <div className="social-links">
            <motion.a href="#" whileHover={{ y: -5, color: 'hsl(var(--accent-1))' }} aria-label="Twitter">
              <X size={20} />
            </motion.a>
            <motion.a href="#" whileHover={{ y: -5, color: 'hsl(var(--accent-2))' }} aria-label="LinkedIn">
              <Users size={20} />
            </motion.a>
            <motion.a 
              href="https://www.instagram.com/growvion.india?igsh=MWVxOTk3azh6cXZ0YQ==" 
              target="_blank" 
              rel="noopener noreferrer" 
              whileHover={{ y: -5, color: 'hsl(var(--accent-3))' }} 
              aria-label="Instagram"
            >
              <Camera size={20} />
            </motion.a>
          </div>

          <motion.button 
            className="scroll-top-btn"
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
