document.addEventListener('DOMContentLoaded', () => {
    // Reveal Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.service-card, .section-title, .hero-content, .about-grid, .team-card');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // --- NAVIGATION ACTIVE STATE & SCROLLSPY ---
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');
    const navLine = document.querySelector('.nav-active-line');
    const navContainer = document.querySelector('.nav-links');

    function updateNavLine() {
        // Find the currently active link
        const activeLink = document.querySelector('.nav-links a.active');
        if (activeLink && navLine && navContainer) {
            const linkRect = activeLink.getBoundingClientRect();
            const containerRect = navContainer.getBoundingClientRect();

            // Calculate relative position within the nav container
            const left = linkRect.left - containerRect.left;
            const width = linkRect.width;

            navLine.style.width = width + 'px';
            navLine.style.left = left + 'px';
        } else if (navLine) {
            // Hide line if no active link (e.g., at very top or outside sections)
            navLine.style.width = '0';
        }
    }

    // ScrollSpy Logic
    function onScroll() {
        let currentSection = "";

        // Adjust offset for header height
        const headerHeight = 100;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - headerHeight)) {
                currentSection = section.getAttribute('id');
            }
        });

        // Loop through links and remove/add active class
        navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(currentSection)) {
                link.classList.add('active');
            }
        });

        // Special case: If near top of page, and no section matched (or home matched), 
        // ensure Home is active or handle empty state.
        if (window.scrollY < 50) {
            const homeLink = document.querySelector('a[href="#home"]');
            if (homeLink) homeLink.classList.add('active');
        }

        updateNavLine();
    }

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', updateNavLine);

    // Initial call
    onScroll();


    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile Menu Toggle (Basic)
    /* 
    const menuBtn = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if(menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active'); // Add CSS for .active later if needed
        });
    }
    */

    // --- FORM SUBMISSION (LOCAL DATA SIMULATION) ---
    // We intercept the form to save data to localStorage BEFORE Formspree (or instead of it)
    // allowing the owner to view it in admin.html
    const contactForm = document.querySelector('form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            // Optional: If you want to ONLY test local admin, preventDefault. 
            // If you want BOTH email and admin, keep it. 
            // Let's preventDefault for now so the user sees the "Success" alert quickly without leaving page.
            e.preventDefault();

            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone') || 'N/A',
                message: formData.get('message'),
                date: new Date().toISOString()
            };

            // Save to LocalStorage
            const existingLeads = JSON.parse(localStorage.getItem('impactVisualsLeads')) || [];
            existingLeads.push(data);
            localStorage.setItem('impactVisualsLeads', JSON.stringify(existingLeads));

            // Show Feedback (Inline)
            const successMsg = document.getElementById('formSuccess');
            if (successMsg) {
                successMsg.style.display = 'flex';
                // Optional: Hide again after 5 seconds
                setTimeout(() => {
                    successMsg.style.display = 'none';
                }, 5000);
            }

            this.reset();
        });
    }
});
