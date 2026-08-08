import React, { createContext, useContext, useEffect } from 'react';
import tracker from '../analytics/tracker';

const AnalyticsContext = createContext(null);

export const useAnalytics = () => {
    const context = useContext(AnalyticsContext);
    if (!context) {
        console.warn('useAnalytics must be used within an AnalyticsProvider.');
    }
    return context;
};

export const AnalyticsProvider = ({ children }) => {
    useEffect(() => {
        // 1. Initialize visitor telemetry session on load
        tracker.initSession();

        // 2. Setup Global Click event listener using event delegation
        // This automatically tracks any click on elements with a `data-track` attribute OR interactive buttons/links
        const handleGlobalClick = (event) => {
            let target = event.target;

            // Bubble up to parent tags to find tracking attribute or button/link boundaries
            while (target && target !== document.body) {
                // Scenario A: Element has explicit data-track override
                const trackAttr = target.getAttribute('data-track');
                if (trackAttr) {
                    tracker.logClick(trackAttr, window.location.pathname);
                    return;
                }

                // Scenario B: Automatically track common links or button interactions
                const tagName = target.tagName;
                const isFormSubmit = target.type === 'submit';

                if (tagName === 'BUTTON' || tagName === 'A' || isFormSubmit) {
                    // Build logical descriptors
                    let label = target.innerText || target.getAttribute('aria-label') || target.alt || '';
                    label = label.trim().substring(0, 40);

                    // Refine names based on context (e.g. icons, image links)
                    if (!label && tagName === 'A') {
                        const href = target.getAttribute('href') || '';
                        if (href.startsWith('mailto:')) label = `Email: ${href.replace('mailto:', '')}`;
                        else if (href.startsWith('tel:')) label = `Phone: ${href.replace('tel:', '')}`;
                        else label = `Link: ${href}`;
                    } else if (!label && target.querySelector('img')) {
                        label = `Image Link: ${target.querySelector('img').alt || 'unnamed'}`;
                    }

                    if (label) {
                        tracker.logClick(`${tagName.toUpperCase()}: ${label}`, window.location.pathname);
                    }
                    return;
                }

                target = target.parentElement;
            }
        };

        document.addEventListener('click', handleGlobalClick, { capture: true });

        // Cleanup tracking timers and click listeners on unmount
        return () => {
            document.removeEventListener('click', handleGlobalClick, { capture: true });
            tracker.disconnect();
        };
    }, []);

    // Provide methods in context to allow buttons/links to fire custom event captures
    const contextValue = {
        logClick: (name) => tracker.logClick(name, window.location.pathname),
        logPageView: (path) => tracker.logPageView(path),
        getSessionId: () => tracker.sessionId,
        getVisitorId: () => tracker.visitorId
    };

    return (
        <AnalyticsContext.Provider value={contextValue}>
            {children}
        </AnalyticsContext.Provider>
    );
};
