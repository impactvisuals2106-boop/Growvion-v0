import { motion } from 'framer-motion';
import { ExternalLink, Zap, Rocket } from 'lucide-react';
import './Services.css';
import ivLogo from '../assets/iv-logo-light.png';

const Services = () => {
  const services = [
    {
      id: 1,
      title: 'Impact Visuals',
      subtitle: 'Marketing Agency',
      description: 'Elevate your brand with data-driven visual marketing strategies that convert visibility into growth.',
      icon: <img src={ivLogo} alt="Impact Visuals Logo" className="service-logo" />,
      status: 'active',
      link: 'https://impactvisuals.growvion.app/',
      iconUrl: true
    },
    {
      id: 2,
      title: 'COMING SOON',
      // subtitle: 'Tech Innovations',
      // description: 'A revolutionary new platform currently under development. Stay tuned as we build the future.',
      icon: <Rocket size={40} className="service-icon-lucide" />,
      // status: 'coming_soon',
      link: '#'
    },
    {
      id: 3,
      title: 'COMING SOON',
     // subtitle: 'Enterprise Solutions',
      // description: 'Comprehensive tools exclusively built for tomorrow’s leaders. Our team is finalizing the architecture.',
      icon: <Zap size={40} className="service-icon-lucide" />,
      // status: 'coming_soon',
      link: '#'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
    }
  };

  return (
    <section id="services" className="services">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="section-header"
        >
          <h2 className="section-title">Our <span className="text-gradient">Umbrella</span> Services</h2>
          <p className="section-subtitle">Discover the portfolio of cutting-edge solutions incubated under the Growvion ecosystem.</p>
        </motion.div>

        <motion.div 
          className="services-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {services.map((service) => (
            <motion.div 
              key={service.id} 
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              className={`service-card glass-panel ${service.status}`}
            >
              <div className="service-icon">
                <div className="icon-wrapper">
                  {service.icon}
                </div>
              </div>
              <div className="service-content">
                {service.status === 'active' ? (
                  <>
                    <div className="live-badge">
                      <span className="live-dot"></span> Live Now
                    </div>
                    <h3 className="service-title">{service.title}</h3>
                    <h4 className="service-subtitle">{service.subtitle}</h4>
                    <p className="service-description">{service.description}</p>

                    <a href={service.link} target="_blank" rel="noopener noreferrer" className="service-link btn-primary">
                      Visit Site <ExternalLink size={16} />
                    </a>
                  </>
                ) : (
                  <div className="coming-soon-wrapper">
                    <div className="coming-soon-content">
                      <h3 className="service-title">{service.title}</h3>
                      <h4 className="service-subtitle">{service.subtitle}</h4>
                      <div className="coming-soon-badge">
                        <span className="glitch-text">COMING SOON</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
