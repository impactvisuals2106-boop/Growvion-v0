import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.23, 1, 0.32, 1],
      },
    },
  };

  return (
    <section id="home" className="hero">
      <div className="hero-background">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="glow glow-1"
        ></motion.div>
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            x: [0, -50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="glow glow-2"
        ></motion.div>
      </div>

      <motion.div 
        className="container hero-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="hero-content">
          <motion.div variants={itemVariants} className="badge glass-panel">
            <span className="pulsing-dot"></span>
            <Sparkles size={14} className="badge-icon" />
            Next-Gen Startup Group
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="hero-title">
            Empowering the Future with <br />
            <span className="text-gradient">Limitless Potential</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="hero-subtitle">
            Growvion is a forward-thinking umbrella organization housing cutting-edge services. From high-impact visual marketing to exclusive upcoming ventures, we are here to redefine the standard.
          </motion.p>
          
          <motion.div variants={itemVariants} className="hero-actions">
            <a href="#services" className="btn-primary btn-large">
              Explore Our Services <ArrowRight size={20} />
            </a>
            <a href="#contact" className="btn-secondary btn-large glass-panel">
              Get in Touch
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
