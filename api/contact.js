import { supabase, sendAlertEmail, checkRateLimit, setCorsHeaders } from './_lib/utils.js';

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

    // 2. Extract Client IP & rate limit
    let ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '127.0.0.1';
    if (ip.includes(',')) ip = ip.split(',')[0].trim();

    if (!checkRateLimit(ip)) {
        res.status(429).json({ error: 'Too Many Requests' });
        return;
    }

    try {
        const { sessionId, visitorId, serviceSlug, name, email, phone, company, message } = req.body;

        // Input Validation & Sanitization
        if (!name || !email || !message) {
            res.status(400).json({ error: 'Missing required fields: name, email, and message.' });
            return;
        }

        // Simple Email validator
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            res.status(400).json({ error: 'Invalid email address format.' });
            return;
        }

        // Clean values to prevent XSS
        const sanitizedName = name.replace(/<[^>]*>/g, '').trim();
        const sanitizedEmail = email.toLowerCase().trim();
        const sanitizedPhone = phone ? phone.replace(/[^0-9+\-\s()]/g, '').trim() : '';
        const sanitizedCompany = company ? company.replace(/<[^>]*>/g, '').trim() : '';
        const sanitizedMessage = message.replace(/<[^>]*>/g, '').trim();

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

        // Save submission details into Supabase (bypasses RLS)
        const { data: submission, error: dbError } = await supabase
            .from('contact_messages')
            .insert({
                service_id: service.id,
                visitor_id: visitorDbId,
                name: sanitizedName,
                email: sanitizedEmail,
                phone: sanitizedPhone,
                company: sanitizedCompany,
                message: sanitizedMessage,
                website_source: slug
            })
            .select('id')
            .single();

        if (dbError) {
            console.error('[Database Contact Log Error]', dbError);
            throw dbError;
        }

        // Trigger Notification: notify on someone submits contact form
        // Fetch session context for geographic transparency if visitor exists
        let geoContext = 'No Session Context Available';
        if (visitorDbId) {
            const { data: sess } = await supabase
                .from('visitors')
                .select('city, region, country, device_type, browser')
                .eq('id', visitorDbId)
                .single();
            if (sess) {
                geoContext = `${sess.city || 'Unknown City'}, ${sess.region || 'Unknown Region'}, ${sess.country || 'Unknown Country'} (Device: ${sess.device_type}, Browser: ${sess.browser})`;
            }
        }

        const subject = `📥 Growvex Contact Form Submission - ${sanitizedName}`;
        const bodyText = `New contact form submission received.
Lead Details:
- Submission ID: ${submission.id}
- Name: ${sanitizedName}
- Email: ${sanitizedEmail}
- Company: ${sanitizedCompany || 'None'}
- Phone: ${sanitizedPhone || 'Not provided'}
- Message:
"${sanitizedMessage}"
----------------------------
Visitor Context:
- Session ID: ${sessionId || 'None'}
- Geolocation / Device: ${geoContext}
- Time: ${new Date().toISOString()}`;

        await sendAlertEmail(subject, bodyText);

        res.status(200).json({ success: true, submissionId: submission.id });
    } catch (error) {
        console.error('[Contact Form API Exception]', error);
        res.status(500).json({ error: error.message || 'Internal Contact Processing Server Error' });
    }
};
