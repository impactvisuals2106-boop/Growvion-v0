import { supabase, hashIp, sendAlertEmail, checkRateLimit, setCorsHeaders } from './_lib/utils.js';

export default async function handler(req, res) {
    // 1. CORS Preflight
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    // 2. Extract client IP & rate limit
    let ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '127.0.0.1';
    if (ip.includes(',')) ip = ip.split(',')[0].trim();

    if (!checkRateLimit(ip)) {
        res.status(429).json({ error: 'Too Many Requests' });
        return;
    }

    try {
        const {
            type,
            visitorId,
            sessionId,
            device,
            browser,
            os,
            resolution,
            language,
            serviceSlug,
            path,
            referrer,
            duration
        } = req.body;

        // Validation checks
        if (!type || !visitorId) {
            res.status(400).json({ error: 'Missing type or visitorId parameters.' });
            return;
        }

        const ipHash = hashIp(ip);

        // Resolve location via Vercel Edge Headers
        const country = req.headers['x-vercel-ip-country'] || (ip === '127.0.0.1' ? 'Local Development' : 'Unknown');
        const region = req.headers['x-vercel-ip-country-region'] || (ip === '127.0.0.1' ? 'Local Region' : 'Unknown');
        const city = req.headers['x-vercel-ip-city'] || (ip === '127.0.0.1' ? 'Local City' : 'Unknown');
        const timezone = req.headers['x-vercel-ip-timezone'] || 'Asia/Kolkata';

        // Resolve service_id from serviceSlug
        const slug = serviceSlug || 'growvion';
        const { data: service, error: svcError } = await supabase
            .from('services')
            .select('id')
            .eq('slug', slug)
            .single();

        if (svcError || !service) {
            console.error('[Services Lookup Failure]', svcError);
            res.status(404).json({ error: `Registered service context not found for slug '${slug}'.` });
            return;
        }

        // --- SESSION INITIALIZATION ('init') ---
        if (type === 'init') {
            const entryPath = path || '/';
            // Establish a session grouping UUID context
            const activeSessionId = sessionId || (crypto && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2));

            // Upsert visitor profile securely (bypasses RLS utilizing service_role client)
            const { data: visitor, error: visError } = await supabase
                .from('visitors')
                .upsert({
                    service_id: service.id,
                    visitor_hash: visitorId,
                    ip_hash: ipHash,
                    device_type: device || 'desktop',
                    browser: browser || 'Unknown',
                    os: os || 'Unknown',
                    resolution: resolution || 'Unknown',
                    language: language || 'en',
                    timezone: timezone,
                    country: country,
                    region: region,
                    city: city
                }, { onConflict: 'service_id,visitor_hash' })
                .select('id')
                .single();

            if (visError || !visitor) {
                console.error('[Database Visitor Log Error]', visError);
                throw visError || new Error('Failed to log visitor.');
            }

            // Immediately register the first page view flow entry
            const { error: pvError } = await supabase
                .from('page_views')
                .insert({
                    service_id: service.id,
                    visitor_id: visitor.id,
                    session_id: activeSessionId,
                    path: entryPath,
                    referrer: referrer || null,
                    time_spent_seconds: 0,
                    is_entry: true
                });

            if (pvError) {
                console.error('[Database Pageview Insert Error]', pvError);
            }

            res.status(200).json({ success: true, sessionId: activeSessionId });
            return;
        }

        // --- PAGE VIEW LOGGING ('pageview') ---
        if (type === 'pageview') {
            if (!path) {
                res.status(400).json({ error: 'Missing path parameter for pageview.' });
                return;
            }

            // Fetch the primary key uuid mapping matching visitorId string hash
            const { data: visitor } = await supabase
                .from('visitors')
                .select('id')
                .eq('visitor_hash', visitorId)
                .eq('service_id', service.id)
                .single();

            if (!visitor) {
                res.status(400).json({ error: 'Associated visitor registry not found.' });
                return;
            }

            const { error: pvError } = await supabase
                .from('page_views')
                .insert({
                    service_id: service.id,
                    visitor_id: visitor.id,
                    session_id: sessionId,
                    path: path,
                    referrer: referrer || null,
                    time_spent_seconds: 0
                });

            if (pvError) {
                console.error('[Database Pageview Error]', pvError);
                throw pvError;
            }

            res.status(200).json({ success: true });
            return;
        }

        // --- SESSION HEARTBEAT / KEEPALIVE ('heartbeat') ---
        if (type === 'heartbeat') {
            const keepAliveDuration = duration || 0;
            const exitPath = path || '/';

            // Find matching page view row and update accumulated duration
            const { error: sessUpdError } = await supabase
                .from('page_views')
                .update({ time_spent_seconds: keepAliveDuration })
                .eq('session_id', sessionId)
                .eq('path', exitPath);

            if (sessUpdError) {
                console.error('[Pageview Keepalive Update Error]', sessUpdError);
                throw sessUpdError;
            }

            res.status(200).json({ success: true });
            return;
        }

        res.status(400).json({ error: `Invalid operation: unknown event type '${type}'.` });
    } catch (error) {
        console.error('[Ingest API Handler Internal Exception]', error);
        res.status(500).json({ error: error.message || 'Internal Database Ingestion Server Error' });
    }
};
