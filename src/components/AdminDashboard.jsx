import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
    LayoutDashboard, Users, Link as LinkIcon, Mail, Laptop, MapPin, 
    FileText, Settings, Search, ChevronLeft, ChevronRight, LogOut, 
    Download, ShieldAlert, KeyRound, Loader2, ArrowLeftRight, TrendingUp,
    RefreshCw, Globe, ArrowUpRight
} from 'lucide-react';
import './AdminDashboard.css';
import { motion } from 'framer-motion';

// Initialize Supabase Client safely to avoid top-level crashes if environment variables are missing.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

const ADMIN_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

const AdminDashboard = () => {
    // 1. STATE MANAGEMENT
    const [session, setSession] = useState(null);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState('');

    const [activeTab, setActiveTab] = useState('overview'); // overview, visitors, traffic, clicks, leads, devices, locations, reports
    const [dateRange, setDateRange] = useState('7d'); // today, yesterday, 7d, 30d, this_month, last_month, year
    
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    const [loadError, setLoadError] = useState('');

    // Pagination & Search States
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Report Generation States
    const [reportType, setReportType] = useState('sessions');
    const [reportFormat, setReportFormat] = useState('xlsx');
    const [exporting, setExporting] = useState(false);

    // 2. LIFECYCLE HOOKS
    useEffect(() => {
        if (!supabase) {
            setAuthLoading(false);
            setAuthError('Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
            return;
        }

        // Retrieve local Supabase session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setAuthLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (session) {
            fetchAnalytics();
        }
    }, [session, dateRange]);

    // Reset pagination on search or tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeTab]);

    // 3. ACTIONS
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!supabase) {
            setAuthError('Supabase is not configured.');
            return;
        }
        setAuthLoading(true);
        setAuthError('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword
            });

            if (error) {
                setAuthError(error.message);
            } else {
                setSession(data.session);
            }
        } catch (err) {
            setAuthError('Authentication service failed.');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        setSession(null);
        setAnalyticsData(null);
    };

    const fetchAnalytics = async () => {
        setLoadingData(true);
        setLoadError('');

        try {
            const token = session?.access_token;
            if (!token) throw new Error('Unauthenticated user session key.');

            const res = await fetch(`/api/dashboard?range=${dateRange}`, {
                headers: { authorization: `Bearer ${token}` }
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setAnalyticsData(data);
            } else {
                setLoadError(data.error || 'Failed to aggregate analytics.');
            }
        } catch (err) {
            console.error('[Dashboard fetch exception]', err);
            setLoadError('A connection error occurred while querying analytics.');
        } finally {
            setLoadingData(false);
        }
    };

    const handleExport = async (e) => {
        e.preventDefault();
        setExporting(true);

        try {
            const token = session?.access_token;
            if (!token) throw new Error('Unauthenticated session.');

            const res = await fetch(`/api/reports?type=${reportType}&format=${reportFormat}&range=${dateRange}`, {
                headers: { authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error('Server failed to compile document.');
            }

            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${reportType}_report_${dateRange}_${new Date().toISOString().substring(0, 10)}.${reportFormat}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            alert(err.message || 'Report download failed.');
        } finally {
            setExporting(false);
        }
    };

    // 4. RENDERING VIEWS
    if (authLoading) {
        return (
            <div className="auth-fallback-center dark-theme">
                <Loader2 className="animate-spin text-accent" size={48} />
                <p>Establishing Security Context...</p>
            </div>
        );
    }

    // A. LOGIN VIEW
    if (!session) {
        return (
            <div className="login-page dark-theme">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="login-card glass-panel"
                >
                    <div className="logo-center">
                        <img src="/Growvex-logo-white.png" alt="Growvex" className="brand-logo-img" />
                        <span className="badge-admin">Analytics System Portal</span>
                    </div>

                    <form onSubmit={handleLogin} className="login-form">
                        <h3>Secure Administrator Login</h3>
                        
                        {authError && (
                            <div className="error-banner">
                                <ShieldAlert size={18} />
                                <span>{authError}</span>
                            </div>
                        )}

                        <div className="input-group">
                            <label>Admin ID EmailAddress</label>
                            <input 
                                type="email" 
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                placeholder="impactvisuals2106@gmail.com" 
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Secret Password Passkey</label>
                            <input 
                                type="password" 
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="••••••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary w-full" disabled={authLoading}>
                            Authenticate Credentials <KeyRound size={18} />
                        </button>

                        <div className="login-back-notice">
                            <a href="/">&larr; Return to main landing page</a>
                        </div>
                    </form>
                </motion.div>
            </div>
        );
    }

    // B. DASHBOARD MAIN VIEW
    const summary = analyticsData?.summary || {
        totalVisitors: 0, uniqueVisitors: 0, returningVisitors: 0,
        liveVisitors: 0, bounceRate: 0, avgSessionDuration: 0, conversionRate: 0, totalLeads: 0
    };

    return (
        <div className="dashboard-layout dark-theme">
            {/* Sidebar navigation */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <img src="/Growvex-logo-white.png" alt="Growvex" className="logo-img" />
                    <span className="badge-side">Admin BI</span>
                </div>

                <nav className="sidebar-nav">
                    <a className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                        <LayoutDashboard size={18} /> Overview
                    </a>
                    <a className={activeTab === 'visitors' ? 'active' : ''} onClick={() => setActiveTab('visitors')}>
                        <Users size={18} /> Visitors Log
                    </a>
                    <a className={activeTab === 'traffic' ? 'active' : ''} onClick={() => setActiveTab('traffic')}>
                        <ArrowLeftRight size={18} /> Traffic Sources
                    </a>
                    <a className={activeTab === 'clicks' ? 'active' : ''} onClick={() => setActiveTab('clicks')}>
                        <LinkIcon size={18} /> Click Events
                    </a>
                    <a className={activeTab === 'leads' ? 'active' : ''} onClick={() => setActiveTab('leads')}>
                        <Mail size={18} /> Contact Leads
                    </a>
                    <a className={activeTab === 'devices' ? 'active' : ''} onClick={() => setActiveTab('devices')}>
                        <Laptop size={18} /> OS & Devices
                    </a>
                    <a className={activeTab === 'locations' ? 'active' : ''} onClick={() => setActiveTab('locations')}>
                        <MapPin size={18} /> Locations
                    </a>
                    <a className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
                        <FileText size={18} /> Exports & Reports
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <p className="user-email">{session?.user?.email}</p>
                        <span className="role-tag">Superadmin</span>
                    </div>
                    <button onClick={handleLogout} className="btn-logout">
                        <LogOut size={16} /> Log Out Account
                    </button>
                </div>
            </aside>

            {/* Main content viewport */}
            <main className="content-container">
                <header className="content-header">
                    <div className="header-meta">
                        <h2>Administrative Control Panel</h2>
                        <p>Real-Time Visitor Telemetry & Analytics Hub</p>
                    </div>

                    <div className="header-actions">
                        <div className="date-select-group">
                            <span className="live-indicator pulse-ping">
                                <span className="ping-dot"></span>
                                {summary.liveVisitors} Live Online
                            </span>

                            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="this_month">This Month</option>
                                <option value="last_month">Last Month</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>

                        <button onClick={fetchAnalytics} className="btn-refresh" disabled={loadingData}>
                            {loadingData ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                        </button>
                    </div>
                </header>

                {loadError && (
                    <div className="error-banner mb-6">
                        <ShieldAlert size={20} />
                        <span>{loadError}</span>
                    </div>
                )}

                {/* Subpage Contents */}
                {loadingData && !analyticsData ? (
                    <div className="loading-card glass-panel container-view">
                        <Loader2 className="animate-spin text-accent" size={48} />
                        <p>Aggregating BI telemetry for range...</p>
                    </div>
                ) : (
                    <>
                        {/* Summary overview panels */}
                        <section className="summary-grid">
                            <div className="stat-panel glass-panel">
                                <div className="stat-label">Total Session Visits</div>
                                <div className="stat-val">{summary.totalVisitors}</div>
                                <span className="trend-lbl positive"><TrendingUp size={14} /> Total Traffic</span>
                            </div>
                            <div className="stat-panel glass-panel">
                                <div className="stat-label">Unique Browsers</div>
                                <div className="stat-val">{summary.uniqueVisitors}</div>
                                <span className="trend-lbl">Unique Visitors</span>
                            </div>
                            <div className="stat-panel glass-panel">
                                <div className="stat-label">Bounce Rate</div>
                                <div className="stat-val">{summary.bounceRate}%</div>
                                <span className="trend-lbl negative">&lt; 10s Sessions</span>
                            </div>
                            <div className="stat-panel glass-panel">
                                <div className="stat-label">Avg. Duration on Site</div>
                                <div className="stat-val">{Math.floor(summary.avgSessionDuration / 60)}m {summary.avgSessionDuration % 60}s</div>
                                <span className="trend-lbl">Session Retention</span>
                            </div>
                            <div className="stat-panel glass-panel">
                                <div className="stat-label">Contact Conversion</div>
                                <div className="stat-val">{summary.conversionRate}%</div>
                                <span className="trend-lbl positive">{summary.totalLeads} Lead queries</span>
                            </div>
                        </section>

                        <div className="inner-view-wrapper">
                            {/* OVERVIEW SECTION */}
                            {activeTab === 'overview' && (
                                <div className="view-pane">
                                    <div className="chart-wrapper glass-panel">
                                        <h3>Traffic Trends (Visitors & Pageviews)</h3>
                                        <div style={{ width: '100%', height: 350 }}>
                                            <ResponsiveContainer>
                                                <AreaChart data={analyticsData?.charts?.growth || []}>
                                                    <defs>
                                                        <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                        </linearGradient>
                                                        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 12 }} />
                                                    <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#111318', border: '1px solid #1f2937', color: '#e4e6eb' }} />
                                                    <Legend />
                                                    <Area type="monotone" name="Unique Visitors" dataKey="visitors" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVis)" />
                                                    <Area type="monotone" name="Pageviews" dataKey="pageviews" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorPv)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="table-grids-2">
                                        <div className="glass-panel text-list-card">
                                            <h3>Most Visited Pages</h3>
                                            <div className="custom-table-container">
                                                <table className="custom-table">
                                                    <thead>
                                                        <tr><td>Page Path</td><td align="right">Views Count</td></tr>
                                                    </thead>
                                                    <tbody>
                                                        {analyticsData?.mostVisitedPages?.length === 0 ? (
                                                            <tr><td colSpan="2" align="center">No views logged.</td></tr>
                                                        ) : (
                                                            analyticsData?.mostVisitedPages?.map((p, idx) => (
                                                                <tr key={idx}><td>{p.name}</td><td align="right">{p.value}</td></tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="glass-panel text-list-card">
                                            <h3>Top Clicked CTA Buttons</h3>
                                            <div className="custom-table-container">
                                                <table className="custom-table">
                                                    <thead>
                                                        <tr><td>CTA Button Label</td><td align="right">Clicks</td></tr>
                                                    </thead>
                                                    <tbody>
                                                        {analyticsData?.mostClickedButtons?.length === 0 ? (
                                                            <tr><td colSpan="2" align="center">No clicks logged.</td></tr>
                                                        ) : (
                                                            analyticsData?.mostClickedButtons?.map((c, idx) => (
                                                                <tr key={idx}><td>{c.name}</td><td align="right">{c.value}</td></tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* VISITORS LOG SECTION */}
                            {activeTab === 'visitors' && (
                                <div className="view-pane glass-panel">
                                    <div className="list-header">
                                        <h3>Recent Visitors Session Log</h3>
                                        <div className="search-box">
                                            <Search size={16} />
                                            <input 
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search Visitor ID, OS, Browser, Location..."
                                            />
                                        </div>
                                    </div>

                                    <div className="custom-table-container">
                                        {(() => {
                                            const filtered = (analyticsData?.recentSessions || []).filter(s => {
                                                const matches = `${s.visitor_id} ${s.device} ${s.os} ${s.browser} ${s.city} ${s.country}`.toLowerCase();
                                                return matches.includes(searchTerm.toLowerCase());
                                            });

                                            const totalFiltered = filtered.length;
                                            const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                                            return (
                                                <>
                                                    <table className="custom-table">
                                                        <thead>
                                                            <tr>
                                                                <td>Session / Visitor ID</td>
                                                                <td>Location</td>
                                                                <td>Traffic Source</td>
                                                                <td>Device & OS</td>
                                                                <td>Duration</td>
                                                                <td>Max Scroll</td>
                                                                <td>Time</td>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {paginated.length === 0 ? (
                                                                <tr><td colSpan="7" align="center">No sessions match search parameters.</td></tr>
                                                            ) : (
                                                                paginated.map((s, idx) => (
                                                                    <tr key={s.id || idx}>
                                                                        <td>
                                                                            <span className="mono-txt truncate" title={s.visitor_id}>{s.visitor_id.substring(0, 16)}...</span>
                                                                        </td>
                                                                        <td>{s.city || 'Local'}, {s.country || 'Development'}</td>
                                                                        <td>{s.traffic_source}</td>
                                                                        <td>{s.device} ({s.os} / {s.browser})</td>
                                                                        <td>{Math.floor(s.duration / 60)}m {s.duration % 60}s</td>
                                                                        <td>{s.scroll_percentage}%</td>
                                                                        <td>{new Date(s.created_at).toLocaleString()}</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>

                                                    {/* Pagination Controls */}
                                                    {totalFiltered > itemsPerPage && (
                                                        <div className="pagination-bar">
                                                            <button 
                                                                disabled={currentPage === 1}
                                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                            >
                                                                <ChevronLeft size={16} /> Prev
                                                            </button>
                                                            <span>Page {currentPage} of {Math.ceil(totalFiltered / itemsPerPage)}</span>
                                                            <button 
                                                                disabled={currentPage >= Math.ceil(totalFiltered / itemsPerPage)}
                                                                onClick={() => setCurrentPage(prev => prev + 1)}
                                                            >
                                                                Next <ChevronRight size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* TRAFFIC SOURCES SECTION */}
                            {activeTab === 'traffic' && (
                                <div className="view-pane table-grids-2">
                                    <div className="chart-wrapper glass-panel">
                                        <h3>Traffic Sources Distribution</h3>
                                        <div style={{ width: '100%', height: 320 }}>
                                            <ResponsiveContainer>
                                                <PieChart>
                                                    <Pie
                                                        data={analyticsData?.charts?.traffic || []}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                        outerRadius={105}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {(analyticsData?.charts?.traffic || []).map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={ADMIN_COLORS[index % ADMIN_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="glass-panel text-list-card">
                                        <h3>Traffic Ingestion Logs</h3>
                                        <div className="custom-table-container">
                                            <table className="custom-table">
                                                <thead>
                                                    <tr><td>Source Channels</td><td align="right">Visits Logged</td></tr>
                                                </thead>
                                                <tbody>
                                                    {analyticsData?.charts?.traffic?.length === 0 ? (
                                                        <tr><td colSpan="2" align="center">No traffic logged.</td></tr>
                                                    ) : (
                                                        analyticsData?.charts?.traffic?.map((t, idx) => (
                                                            <tr key={idx}><td>{t.name}</td><td align="right">{t.value}</td></tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CLICK EVENTS SECTION */}
                            {activeTab === 'clicks' && (
                                <div className="view-pane glass-panel">
                                    <h3>User Interactive Button Clicks</h3>
                                    <div style={{ width: '100%', height: 350 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={analyticsData?.mostClickedButtons || []}>
                                                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 11 }} />
                                                <YAxis stroke="#6b7280" />
                                                <Tooltip contentStyle={{ backgroundColor: '#111318', border: '1px solid #1f2937' }} />
                                                <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]}>
                                                    {(analyticsData?.mostClickedButtons || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={ADMIN_COLORS[index % ADMIN_COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* CONTACT LEADS SECTION */}
                            {activeTab === 'leads' && (
                                <div className="view-pane glass-panel">
                                    <div className="list-header">
                                        <h3>Contact Feedback Leads Submissions</h3>
                                        <div className="search-box">
                                            <Search size={16} />
                                            <input 
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search Name, Email, Phone, Message..."
                                            />
                                        </div>
                                    </div>

                                    <div className="custom-table-container">
                                        {(() => {
                                            const filtered = (analyticsData?.contactLeads || []).filter(l => {
                                                const matches = `${l.name} ${l.email} ${l.phone} ${l.message} ${l.status}`.toLowerCase();
                                                return matches.includes(searchTerm.toLowerCase());
                                            });

                                            const totalFiltered = filtered.length;
                                            const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                                            return (
                                                <>
                                                    <table className="custom-table">
                                                        <thead>
                                                            <tr>
                                                                <td>Name</td>
                                                                <td>Email</td>
                                                                <td>Phone Number</td>
                                                                <td>Message Description</td>
                                                                <td>Status</td>
                                                                <td>Time Captured</td>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {paginated.length === 0 ? (
                                                                <tr><td colSpan="6" align="center">No lead submissions recorded.</td></tr>
                                                            ) : (
                                                                paginated.map((l, idx) => (
                                                                    <tr key={l.id || idx}>
                                                                        <td style={{ fontWeight: '600', color: 'var(--text-gradient-start)' }}>{l.name}</td>
                                                                        <td>{l.email}</td>
                                                                        <td>{l.phone || 'N/A'}</td>
                                                                        <td style={{ maxWidth: '280px', whiteSpace: 'normal', fontSize: 13 }}>{l.message}</td>
                                                                        <td>
                                                                            <span className={`status-badge ${l.status.startsWith('failed') ? 'failed' : 'success'}`}>
                                                                                {l.status}
                                                                            </span>
                                                                        </td>
                                                                        <td>{new Date(l.created_at).toLocaleString()}</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>

                                                    {/* Pagination Controls */}
                                                    {totalFiltered > itemsPerPage && (
                                                        <div className="pagination-bar">
                                                            <button 
                                                                disabled={currentPage === 1}
                                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                            >
                                                                <ChevronLeft size={16} /> Prev
                                                            </button>
                                                            <span>Page {currentPage} of {Math.ceil(totalFiltered / itemsPerPage)}</span>
                                                            <button 
                                                                disabled={currentPage >= Math.ceil(totalFiltered / itemsPerPage)}
                                                                onClick={() => setCurrentPage(prev => prev + 1)}
                                                            >
                                                                Next <ChevronRight size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* DEVICES & BROWSERS */}
                            {activeTab === 'devices' && (
                                <div className="view-pane table-grids-2">
                                    <div className="glass-panel text-list-card">
                                        <h3>Client Browser Profiles</h3>
                                        <div className="custom-table-container">
                                            <table className="custom-table">
                                                <thead>
                                                    <tr><td>Browser Name</td><td align="right">Active Visits</td></tr>
                                                </thead>
                                                <tbody>
                                                    {analyticsData?.charts?.browsers?.length === 0 ? (
                                                        <tr><td colSpan="2" align="center">No browser data.</td></tr>
                                                    ) : (
                                                        analyticsData?.charts?.browsers?.map((b, idx) => (
                                                            <tr key={idx}><td>{b.name}</td><td align="right">{b.value}</td></tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="glass-panel text-list-card">
                                        <h3>Device Class Breakdown</h3>
                                        <div className="custom-table-container">
                                            <table className="custom-table">
                                                <thead>
                                                    <tr><td>Device Category</td><td align="right">Active Visits</td></tr>
                                                </thead>
                                                <tbody>
                                                    {analyticsData?.charts?.devices?.length === 0 ? (
                                                        <tr><td colSpan="2" align="center">No device data.</td></tr>
                                                    ) : (
                                                        analyticsData?.charts?.devices?.map((d, idx) => (
                                                            <tr key={idx}><td>{d.name}</td><td align="right">{d.value}</td></tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* LOCATIONS SECTION */}
                            {activeTab === 'locations' && (
                                <div className="view-pane table-grids-2">
                                    <div className="glass-panel text-list-card">
                                        <h3>Top Visiting Countries</h3>
                                        <div className="custom-table-container">
                                            <table className="custom-table">
                                                <thead>
                                                    <tr><td>Country Name</td><td align="right">Geo hits</td></tr>
                                                </thead>
                                                <tbody>
                                                    {analyticsData?.charts?.countries?.length === 0 ? (
                                                        <tr><td colSpan="2" align="center">No geographical data.</td></tr>
                                                    ) : (
                                                        analyticsData?.charts?.countries?.map((c, idx) => (
                                                            <tr key={idx}>
                                                                <td>
                                                                    <div className="flex-items font-semibold">
                                                                        <Globe size={14} className="mr-6" /> {c.name}
                                                                    </div>
                                                                </td>
                                                                <td align="right">{c.value}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="glass-panel text-list-card">
                                        <h3>Top Visiting Cities</h3>
                                        <div className="custom-table-container">
                                            <table className="custom-table">
                                                <thead>
                                                    <tr><td>City Area</td><td align="right">Geo hits</td></tr>
                                                </thead>
                                                <tbody>
                                                    {analyticsData?.charts?.cities?.length === 0 ? (
                                                        <tr><td colSpan="2" align="center">No geographical data.</td></tr>
                                                    ) : (
                                                        analyticsData?.charts?.cities?.map((ci, idx) => (
                                                            <tr key={idx}><td>{ci.name}</td><td align="right">{ci.value}</td></tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* REPORTS EXPORTS SECTION */}
                            {activeTab === 'reports' && (
                                <div className="view-pane container-small">
                                    <div className="glass-panel report-form-card">
                                        <div className="card-lbl-header mb-6">
                                            <FileText size={24} className="text-accent" />
                                            <h3>Compile Business Intelligence Reports</h3>
                                            <p>Generate downloadables containing specific historical query ranges.</p>
                                        </div>

                                        <form onSubmit={handleExport} className="report-config-form">
                                            <div className="input-group">
                                                <label>Target Dataset Category</label>
                                                <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                                                    <option value="sessions">Sessions & Device Telemetry</option>
                                                    <option value="clicks">Interactive Click Events</option>
                                                    <option value="leads">Contact Form Lead Submissions</option>
                                                </select>
                                            </div>

                                            <div className="input-group">
                                                <label>Export Format Extension</label>
                                                <select value={reportFormat} onChange={(e) => setReportFormat(e.target.value)}>
                                                    <option value="xlsx">Microsoft Excel Workbook (.xlsx)</option>
                                                    <option value="csv">Standard CSV Text (.csv)</option>
                                                    <option value="pdf">Administrative PDF Preview Document (.pdf)</option>
                                                </select>
                                            </div>

                                            <div className="report-warnings">
                                                <span>Range selection: <strong>{dateRange.toUpperCase()}</strong> (Adjust in header if needed)</span>
                                            </div>

                                            <button type="submit" className="btn-primary w-full" disabled={exporting}>
                                                {exporting ? (
                                                    <>Compiling document... <Loader2 className="animate-spin" size={18} /></>
                                                ) : (
                                                    <>Export Report Dataset <Download size={18} /></>
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
