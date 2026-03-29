import { motion } from 'framer-motion';
import { Mail, Phone, Camera, Users, Send, MessageCircle } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const contactMethods = [
    {
      icon: <Mail size={24} />,
      title: 'Email Us',
      value: 'impactvisuals2106@gmail.com',
      link: 'mailto:impactvisuals2106@gmail.com',
      label: 'Send an Email',
      color: 'var(--accent-1)'
    },
    {
      icon: <Phone size={24} />,
      title: 'Call Us',
      value: '+91 9515251305',
      link: 'tel:+919515251305',
      label: 'Call Now',
      color: 'var(--accent-2)'
    },
    {
      icon: <Camera size={24} />,
      title: 'Instagram',
      value: '@growvion.india',
      link: 'https://www.instagram.com/growvion.india?igsh=MWVxOTk3azh6cXZ0YQ==',
      label: 'Follow Us',
      color: 'var(--accent-3)'
    },
    {
      icon: <Users size={24} />,
      title: 'LinkedIn',
      value: 'Growvion',
      link: '#',
      label: 'Connect',
      color: 'var(--accent-1)'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section id="contact" className="contact">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="contact-card glass-panel"
        >
          <div className="contact-grid">
            <div className="contact-info">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="section-title">Let's <span className="text-gradient">Elevate</span> Your Brand</h2>
                <p className="section-subtitle">Have a vision? We have the tools and expertise to bring it to life. Reach out and let's start something extraordinary.</p>
                
                <div className="contact-methods">
                  {contactMethods.map((method, index) => (
                    <motion.a 
                      key={index}
                      href={method.link}
                      className="contact-method-item"
                      variants={itemVariants}
                      whileHover={{ x: 10 }}
                    >
                      <div className="method-icon" style={{ color: `hsl(${method.color})` }}>
                        {method.icon}
                      </div>
                      <div className="method-text">
                        <h4>{method.title}</h4>
                        <p>{method.value}</p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="contact-form-container">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="form-wrapper"
              >
                <div className="form-header">
                  <MessageCircle className="text-gradient" />
                  <h3>Quick Inquiry</h3>
                </div>
                <form className="contact-form">
                  <div className="input-group">
                    <input type="text" placeholder="Your Name" />
                  </div>
                  <div className="input-group">
                    <input type="email" placeholder="Your Email" />
                  </div>
                  <div className="input-group">
                    <textarea placeholder="Tell us about your project" rows="4"></textarea>
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    Send Message <Send size={18} />
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
