import { motion } from 'framer-motion';
import './Navbar.css';

const Navbar = ({ isScrolled }) => {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      className={`navbar ${isScrolled ? 'scrolled' : ''}`}
    >
      <div className="container nav-container">
        <a href="#" className="logo">
          Grow<span className="text-gradient">vion</span>
        </a>
        
        <nav className="nav-links">
          {['Home', 'Services', 'Contact'].map((item, i) => (
            <motion.a 
              key={item}
              href={`#${item.toLowerCase()}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              {item}
            </motion.a>
          ))}
        </nav>
        
        <motion.a 
          href="#contact" 
          className="btn-primary"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          Get Started
        </motion.a>
      </div>
    </motion.header>
  );
};

export default Navbar;
