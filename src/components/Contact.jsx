import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Camera, Users, Send, MessageCircle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import tracker from '../analytics/tracker';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

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
      value: '@growvex.india',
      link: 'https://www.instagram.com/growvex.india?igsh=MWVxOTk3azh6cXZ0YQ==',
      label: 'Follow Us',
      color: 'var(--accent-3)'
    },
    {
      icon: <Users size={24} />,
      title: 'LinkedIn',
      value: 'Growvex',
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill in all required fields (Name, Email, Message).');
      setFormStatus('error');
      return;
    }

    setFormStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: tracker.sessionId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFormStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setErrorMsg(data.error || 'Failed to submit form. Please try again.');
        setFormStatus('error');
      }
    } catch (err) {
      console.error('[Forms Submission Network Error]', err);
      setErrorMsg('A network error occurred. Please try again later.');
      setFormStatus('error');
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
                      data-track={`Contact: ${method.title} Link Click`}
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
                  <h3>Quick Feedback</h3>
                </div>

                {formStatus === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="form-success-card"
                  >
                    <CheckCircle2 size={44} className="success-icon" />
                    <h4>Thank You!</h4>
                    <p>Your business query and feedback has been received. Our team will contact you shortly.</p>
                    <button
                      onClick={() => setFormStatus('idle')}
                      className="btn-secondary btn-small w-full"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="input-group">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your Name *"
                        required
                        disabled={formStatus === 'loading'}
                      />
                    </div>
                    <div className="input-group">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Your Email *"
                        required
                        disabled={formStatus === 'loading'}
                      />
                    </div>
                    <div className="input-group">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                        disabled={formStatus === 'loading'}
                      />
                    </div>
                    <div className="input-group">
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Please give your feedback about Growvex *"
                        rows="4"
                        required
                        disabled={formStatus === 'loading'}
                      ></textarea>
                    </div>

                    {formStatus === 'error' && (
                      <div className="form-error-banner">
                        <AlertCircle size={16} />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn-primary w-full"
                      disabled={formStatus === 'loading'}
                      data-track="Contact Form: Submit Button"
                    >
                      {formStatus === 'loading' ? (
                        <>Sending Request <Loader2 size={18} className="animate-spin" /></>
                      ) : (
                        <>Send Message <Send size={18} /></>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
