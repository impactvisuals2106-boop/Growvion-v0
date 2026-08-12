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

    // 2. Extract Client IP & rate limit check
    let ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '127.0.0.1';
    if (ip.includes(',')) ip = ip.split(',')[0].trim();

    if (!checkRateLimit(ip)) {
        res.status(429).json({ error: 'Too Many Requests' });
        return;
    }

    try {
        const { sessionId, visitorId, serviceSlug, buttonName, pagePath } = req.body;

        if (!sessionId || !buttonName) {
            res.status(400).json({ error: 'Missing required parameters: sessionId and buttonName.' });
            return;
        }

        // Resolve service context slug
        const slug = serviceSlug || 'growvex';
        const { data: service, error: svcError } = await supabase
            .from('services')
            .select('id')
            .eq('slug', slug)
            .single();

        if (svcError || !service) {
            console.error('[Services Lookup Failure]', svcError);
            res.status(404).json({ error: `Service context not found for slug '${slug}'.` });
            return;
        }

        // Fetch corresponding visitor ID primary key uuid matching visitorId hash representation
        let visitorDbId = null;
        if (visitorId) {
            const { data: visitor } = await supabase
                .from('visitors')
                .select('id')
                .eq('visitor_hash', visitorId)
                .eq('service_id', service.id)
                .single();
            if (visitor) {
                visitorDbId = visitor.id;
            }
        }

        if (!visitorDbId) {
            res.status(400).json({ error: 'Associated visitor registry not found.' });
            return;
        }

        // Insert click interaction record
        const { error } = await supabase
            .from('button_clicks')
            .insert({
                service_id: service.id,
                visitor_id: visitorDbId,
                session_id: sessionId,
                button_name: buttonName,
                page_path: pagePath || '/'
            });

        if (error) {
            console.error('[Database Click Tracking Error]', error);
            throw error;
        }

        // Trigger Notification: clicks Impact Visuals (contains standard matches)
        const isImpactVisualsClick = buttonName.toLowerCase().includes('impact visuals');

        if (isImpactVisualsClick) {
            // Fetch session context for email transparency
            const { data: sessInfo } = await supabase
                .from('visitors')
                .select('device_type, browser, country, city')
                .eq('id', visitorDbId)
                .single();

            const visitorInfo = sessInfo
                ? `${sessInfo.city || 'Unknown City'}, ${sessInfo.country || 'Unknown Country'} (Device: ${sessInfo.device_type}, Browser: ${sessInfo.browser})`
                : 'Unknown Session Context';

            const subject = `🎬 Growvex Clicks Alert - Impact Visuals Clicked`;
            const bodyText = `A visitor just clicked on "Impact Visuals" link on page "${pagePath || '/'}".
Session Context:
- Session ID: ${sessionId}
- Visitor Context: ${visitorInfo}
- Button clicked: ${buttonName}`;
            
            await sendAlertEmail(subject, bodyText);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('[Clicks API Handler Exception]', error);
        res.status(500).json({ error: error.message || 'Internal Click Tracking Database Server Error' });
    }
};
