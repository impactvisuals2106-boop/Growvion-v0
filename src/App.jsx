import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import { AnalyticsProvider } from './components/AnalyticsProvider';
import './App.css';
import { createVisitor } from "./services/visitorService";

function AppContent() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    // Register visitor analytics to Supabase safely
    createVisitor();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Simple state-based router for SPAs - listens to popstate 
    // to update view without page reloads if navigating programmatically.
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Match /admin route to render the Admin Dashboard
  if (currentPath === '/admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="app">
      <Navbar isScrolled={isScrolled} />
      <main>
        <Hero />
        <Services />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AnalyticsProvider>
      <AppContent />
    </AnalyticsProvider>
  );
}

export default App;
