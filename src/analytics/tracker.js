/**
 * GROWVION CLIENT TELEMETRY SDK (tracker.js)
 * Automatically tracks user info, geolocation headers, sessions, duration, scroll depth, and page metrics.
 */

// Generate a random string to act as unique visitor ID
function generateId() {
    const arr = new Uint8Array(16);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(arr);
    } else {
        for (let i = 0; i < 16; i++) arr[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

// Get or Create Visitor ID in persistent storage
function getVisitorId() {
    if (typeof window === 'undefined') return '';
    let visId = localStorage.getItem('gv_visitor_id');
    if (!visId) {
        visId = 'gv_v_' + generateId();
        localStorage.setItem('gv_visitor_id', visId);
    }
    return visId;
}

// Parse device, browser, and OS specifications from User Agent
function getEnvironment() {
    if (typeof window === 'undefined') return {};
    const ua = navigator.userAgent;
    let device = 'Desktop';
    let browser = 'Unknown';
    let os = 'Unknown';

    // Device check
    if (/Mobi|Android|iPhone|iPad/i.test(ua)) {
        device = /Tablet|iPad/i.test(ua) ? 'Tablet' : 'Mobile';
    }

    // Browser check
    if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
    else if (ua.indexOf('Edg') > -1) browser = 'Edge';
    else if (ua.indexOf('OPR') > -1 || ua.indexOf('Opera') > -1) browser = 'Opera';

    // OS check
    if (ua.indexOf('Windows') > -1) os = 'Windows';
    else if (ua.indexOf('Macintosh') > -1) os = 'macOS';
    else if (ua.indexOf('Android') > -1) os = 'Android';
    else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';
    else if (ua.indexOf('Linux') > -1) os = 'Linux';

    return {
        device,
        browser,
        os,
        resolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language || 'en',
    };
}

// Parse URL UTM campaigns & document referrer sources
function getTrafficSource() {
    if (typeof window === 'undefined') return {};
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');

    let trafficSource = 'Direct';
    const referrer = document.referrer;

    if (utmSource) {
        // If UTM parameters exist, parse traffic source
        trafficSource = utmSource.charAt(0).toUpperCase() + utmSource.slice(1);
    } else if (referrer) {
        const refUrl = new URL(referrer);
        const host = refUrl.hostname.toLowerCase();

        if (host.includes('google.co') || host.includes('google.com')) trafficSource = 'Google Search';
        else if (host.includes('instagram.com')) trafficSource = 'Instagram';
        else if (host.includes('facebook.com')) trafficSource = 'Facebook';
        else if (host.includes('linkedin.com')) trafficSource = 'LinkedIn';
        else if (host.includes('twitter.com') || host.includes('t.co')) trafficSource = 'Twitter/X';
        else if (host.includes('youtube.com')) trafficSource = 'YouTube';
        else if (refUrl.host !== window.location.host) trafficSource = refUrl.hostname; // Referral website
    }

    return {
        trafficSource,
        utmSource,
        utmMedium,
        utmCampaign
    };
}

// Client class mapping analytics functions
class GrowvionTracker {
    constructor() {
        this.visitorId = getVisitorId();
        this.sessionId = null;
        this.duration = 0;
        this.maxScroll = 0;
        this.heartbeatTimer = null;
        this.durationTimer = null;
        this.pageActive = true;
    }

    // Hit server API securely
    async sendEvent(endpoint, payload) {
        try {
            // Check dynamic path routing (support localhost or relative root hosts)
            const apiUrl = `${window.location.origin}${endpoint}`;
            const opts = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true // Crucial to ensure unload telemetry packets arrive
            };

            const res = await fetch(apiUrl, opts);
            return await res.json();
        } catch (e) {
            console.warn('[Growvion Tracker Telemetry Send Failure]', e);
            return null;
        }
    }

    // Initialize track session
    async initSession() {
        if (typeof window === 'undefined') return;

        const env = getEnvironment();
        const traffic = getTrafficSource();
        const payload = {
            type: 'init',
            visitorId: this.visitorId,
            path: window.location.pathname,
            referrer: document.referrer || null,
            ...env,
            ...traffic
        };

        const res = await this.sendEvent('/api/track', payload);
        if (res && res.sessionId) {
            this.sessionId = res.sessionId;
            this.startTimers();
            this.setupListeners();
        }
    }

    // Track subpage navigation within SPAs
    async logPageView(path) {
        if (!this.sessionId) return;
        const payload = {
            type: 'pageview',
            visitorId: this.visitorId,
            sessionId: this.sessionId,
            path: path || window.location.pathname,
            referrer: document.referrer || null
        };
        await this.sendEvent('/api/track', payload);
    }

    // Track button & key click events
    async logClick(buttonName, pagePath) {
        if (!this.sessionId) return;
        const payload = {
            sessionId: this.sessionId,
            buttonName: buttonName,
            pagePath: pagePath || window.location.pathname
        };
        await this.sendEvent('/api/clicks', payload);
    }

    // Send keepalive heartbeat session update
    async sendHeartbeat() {
        if (!this.sessionId || !this.pageActive) return;
        const payload = {
            type: 'heartbeat',
            visitorId: this.visitorId,
            sessionId: this.sessionId,
            duration: this.duration,
            scrollPercentage: this.maxScroll,
            path: window.location.pathname
        };
        await this.sendEvent('/api/track', payload);
    }

    startTimers() {
        if (typeof window === 'undefined') return;

        // 1. Tracks running session duration in seconds
        this.durationTimer = setInterval(() => {
            if (this.pageActive) {
                this.duration += 1;
            }
        }, 1000);

        // 2. Throttled heartbeat updates sent every 10 seconds
        this.heartbeatTimer = setInterval(() => {
            this.sendHeartbeat();
        }, 10000);
    }

    setupListeners() {
        if (typeof window === 'undefined') return;

        // A. Scroll Depth telemetric checks
        const handleScroll = () => {
            const h = document.documentElement;
            const b = document.body;
            const st = 'scrollTop';
            const sh = 'scrollHeight';

            const percent = Math.round(
                ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100
            );
            if (!isNaN(percent) && percent > this.maxScroll) {
                this.maxScroll = Math.min(100, percent);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // B. Page Visibility checks (pause timers when visitor minimizes page)
        const handleVisibilityChange = () => {
            this.pageActive = !document.hidden;
            // Send intermediate state save when page is hidden
            if (document.hidden) {
                this.sendHeartbeat();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // C. Final Page Exit unload hook
        const handleUnload = () => {
            // Trigger beacon heartbeat to save exit states
            this.sendHeartbeat();
        };

        window.addEventListener('beforeunload', handleUnload);
    }

    // Cleanup routines
    disconnect() {
        if (this.durationTimer) clearInterval(this.durationTimer);
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    }
}

// Export singleton instance
const tracker = new GrowvionTracker();
export default tracker;
export { GrowvionTracker };
