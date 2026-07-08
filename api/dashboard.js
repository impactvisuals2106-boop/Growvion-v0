import { supabase, verifyAdminAuth, setCorsHeaders } from './_lib/utils.js';

export default async function handler(req, res) {
    // 1. CORS Preflight
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    // 2. Authenticate Admin User session
    const { authorized, error: authError } = await verifyAdminAuth(req);
    if (!authorized) {
        res.status(401).json({ error: authError || 'Unauthorized access' });
        return;
    }

    try {
        const { range } = req.query; // 'today', 'yesterday', '7d', '30d', 'this_month', 'last_month', 'year'
        
        // Build Date range filters
        const now = new Date();
        let startDateValue = new Date();
        let endDateValue = new Date();
        let isRangeComparison = false;

        const getStartOfDay = (d) => {
            const date = new Date(d);
            date.setUTCHours(0, 0, 0, 0);
            return date;
        };

        const getEndOfDay = (d) => {
            const date = new Date(d);
            date.setUTCHours(23, 59, 59, 999);
            return date;
        };

        switch (range) {
            case 'today':
                startDateValue = getStartOfDay(now);
                endDateValue = getEndOfDay(now);
                break;
            case 'yesterday':
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                startDateValue = getStartOfDay(yesterday);
                endDateValue = getEndOfDay(yesterday);
                isRangeComparison = true;
                break;
            case '7d':
                startDateValue = new Date(now);
                startDateValue.setDate(now.getDate() - 7);
                endDateValue = now;
                break;
            case '30d':
                startDateValue = new Date(now);
                startDateValue.setDate(now.getDate() - 30);
                endDateValue = now;
                break;
            case 'this_month':
                startDateValue = new Date(now.getFullYear(), now.getMonth(), 1);
                endDateValue = now;
                break;
            case 'last_month':
                startDateValue = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDateValue = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                isRangeComparison = true;
                break;
            case 'year':
                startDateValue = new Date(now.getFullYear(), 0, 1);
                endDateValue = now;
                break;
            default:
                // Default to 7 days
                startDateValue = new Date(now);
                startDateValue.setDate(now.getDate() - 7);
                endDateValue = now;
        }

        const startIso = startDateValue.toISOString();
        const endIso = endDateValue.toISOString();

        // 3. FETCH METRICS CONCURRENTLY
        const queries = {};

        // A. Total Sessions (Visitors)
        queries.totalSessions = supabase
            .from('analytics_sessions')
            .select('id, visitor_id, duration, scroll_percentage', { count: 'exact' })
            .gte('created_at', startIso)
            .lte('created_at', endIso);

        // B. Unique Visitors count
        queries.uniqueVisitors = supabase
            .rpc('count_unique_visitors_range', { start_time: startIso, end_time: endIso });

        // C. Live visitors (active in last 5 minutes)
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        queries.liveVisitors = supabase
            .from('analytics_sessions')
            .select('id', { count: 'exact' })
            .gte('updated_at', fiveMinAgo);

        // D. Most Visited Pages
        queries.topPages = supabase
            .from('analytics_page_views')
            .select('path')
            .gte('created_at', startIso)
            .lte('created_at', endIso);

        // E. Top Clicks
        queries.topClicks = supabase
            .from('analytics_clicks')
            .select('button_name')
            .gte('created_at', startIso)
            .lte('created_at', endIso);

        // F. Top Traffic Sources
        queries.trafficSources = supabase
            .from('analytics_sessions')
            .select('traffic_source, utm_source, utm_medium, utm_campaign')
            .gte('created_at', startIso)
            .lte('created_at', endIso);

        // G. Device/OS/Browser Distributions
        queries.distributions = supabase
            .from('analytics_sessions')
            .select('device, os, browser')
            .gte('created_at', startIso)
            .lte('created_at', endIso);

        // H. Locations Distributions
        queries.locations = supabase
            .from('analytics_sessions')
            .select('country, region, city')
            .gte('created_at', startIso)
            .lte('created_at', endIso);

        // I. Contact Leads Submissions
        queries.leads = supabase
            .from('analytics_contact_submissions')
            .select('id, name, email, phone, message, status, created_at')
            .gte('created_at', startIso)
            .lte('created_at', endIso)
            .order('created_at', { ascending: false });

        // J. Raw visitor line chart data (daily groupings)
        queries.chartSessions = supabase
            .from('analytics_sessions')
            .select('created_at')
            .gte('created_at', startIso)
            .lte('created_at', endIso);

        queries.chartPageViews = supabase
            .from('analytics_page_views')
            .select('created_at')
            .gte('created_at', startIso)
            .lte('created_at', endIso);

        // Resolve all queries at once
        const results = await Promise.all([
            queries.totalSessions,
            queries.liveVisitors,
            queries.topPages,
            queries.topClicks,
            queries.trafficSources,
            queries.distributions,
            queries.locations,
            queries.leads,
            queries.chartSessions,
            queries.chartPageViews
        ]);

        const [
            sessionsRes,
            liveRes,
            topPagesRes,
            topClicksRes,
            trafficRes,
            distRes,
            locRes,
            leadsRes,
            chartSessRes,
            chartPvRes
        ] = results;

        // Check for DB query errors
        const dbErrors = results.filter(r => r.error);
        if (dbErrors.length > 0) {
            console.error('[Dashboard DB Aggregation Error]', dbErrors.map(e => e.error));
            res.status(500).json({ error: 'Database aggregation logic raised an error.', details: dbErrors.map(e => e.error.message) });
            return;
        }

        const sessions = sessionsRes.data || [];
        const liveCount = liveRes.count || 0;
        const pageviewsList = topPagesRes.data || [];
        const clicksList = topClicksRes.data || [];
        const trafficList = trafficRes.data || [];
        const distList = distRes.data || [];
        const locList = locRes.data || [];
        const leads = leadsRes.data || [];
        const chartSess = chartSessRes.data || [];
        const chartPv = chartPvRes.data || [];

        // calculate Bounce Rate: Active sessions with duration <= 10s and only 1 page view
        // To approximate this since we are aggregating:
        // We'll count sessions where duration <= 10s.
        const totalSessionCount = sessions.length;
        const bouncedCount = sessions.filter(s => (s.duration || 0) <= 10).length;
        const bounceRate = totalSessionCount > 0 ? Math.round((bouncedCount / totalSessionCount) * 100) : 0;

        // Average duration
        const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
        const avgSessionDuration = totalSessionCount > 0 ? Math.round(totalDuration / totalSessionCount) : 0;

        // Unique visitor count processing (Supabase RPC counts unique visitor_ids, otherwise we fallback to local set logic)
        const uniqueSet = new Set(sessions.map(s => s.visitor_id));
        const uniqueVisitorCount = uniqueSet.size;

        // Returning visitors count: count visitor IDs in this period who have had preceding visits.
        // For simplicity: unique visitors is N, total is M. Let's do an approximate returning visitor percentage.
        // Returning visitors = Total Sessions - Unique Visitors
        const returningVisitorsCount = Math.max(0, totalSessionCount - uniqueVisitorCount);

        // Grouping helper
        const groupAndSort = (arr, keyField, limit = 10) => {
            const counts = {};
            arr.forEach(item => {
                const val = item[keyField] || 'Unknown';
                counts[val] = (counts[val] || 0) + 1;
            });
            return Object.entries(counts)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, limit);
        };

        const pagesAgg = groupAndSort(pageviewsList, 'path', 10);
        const clicksAgg = groupAndSort(clicksList, 'button_name', 10);
        const trafficAgg = groupAndSort(trafficList, 'traffic_source', 10);
        
        const countryAgg = groupAndSort(locList, 'country', 10);
        const cityAgg = groupAndSort(locList, 'city', 10);
        const deviceAgg = groupAndSort(distList, 'device', 10);
        const browserAgg = groupAndSort(distList, 'browser', 10);

        // Calculate Conversion Rate: contact submissions divided by unique visitor sessions
        const totalSubmissions = leads.length;
        const conversionRate = totalSessionCount > 0 ? parseFloat(((totalSubmissions / totalSessionCount) * 100).toFixed(2)) : 0.0;

        // --- CHART DATA GENERATION ---
        // Group sessions and pageviews by days/hours depending on range
        const chartDataMap = {};
        
        const formatDateKey = (isoString) => {
            const d = new Date(isoString);
            if (range === 'today' || range === 'yesterday') {
                // Hour groupings
                return `${d.getUTCHours()}:00`;
            }
            // Day groupings
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };

        // Initialize slots
        if (range === 'today' || range === 'yesterday') {
            for (let i = 0; i < 24; i++) {
                chartDataMap[`${i}:00`] = { name: `${i}:00`, visitors: 0, pageviews: 0 };
            }
        }

        chartSess.forEach(s => {
            const key = formatDateKey(s.created_at);
            if (!chartDataMap[key]) {
                chartDataMap[key] = { name: key, visitors: 0, pageviews: 0 };
            }
            chartDataMap[key].visitors += 1;
        });

        chartPv.forEach(pv => {
            const key = formatDateKey(pv.created_at);
            if (!chartDataMap[key]) {
                chartDataMap[key] = { name: key, visitors: 0, pageviews: 0 };
            }
            chartDataMap[key].pageviews += 1;
        });

        // Convert map to sorted list
        let growthChartData = Object.values(chartDataMap);
        if (range !== 'today' && range !== 'yesterday') {
            growthChartData = growthChartData.sort((a, b) => new Date(a.name) - new Date(b.name));
        } else {
            // Sort standard hours
            growthChartData = growthChartData.sort((a, b) => parseInt(a.name) - new Date(b.name));
        }

        res.status(200).json({
            success: true,
            summary: {
                totalVisitors: totalSessionCount,
                uniqueVisitors: uniqueVisitorCount,
                returningVisitors: returningVisitorsCount,
                liveVisitors: liveCount,
                bounceRate: bounceRate,
                avgSessionDuration: avgSessionDuration,
                conversionRate: conversionRate,
                totalLeads: totalSubmissions
            },
            charts: {
                growth: growthChartData, // line chart
                traffic: trafficAgg,     // traffic pie/bar
                devices: deviceAgg,     // devices pie
                browsers: browserAgg,   // browsers bar
                countries: countryAgg,   // country horizontal bar
                cities: cityAgg         // city list
            },
            mostVisitedPages: pagesAgg,
            mostClickedButtons: clicksAgg,
            contactLeads: leads, // raw lists for lists paging
            recentSessions: sessions.slice(0, 50) // list of recent visitors
        });
    } catch (error) {
        console.error('[Dashboard Ingest Controller Exception]', error);
        res.status(500).json({ error: error.message || 'Internal Admin Analytics Aggregator Error' });
    }
};
