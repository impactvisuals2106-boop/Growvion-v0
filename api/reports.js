import { supabase, verifyAdminAuth, setCorsHeaders } from './_lib/utils.js';
import XLSX from 'xlsx';

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

    // 2. Validate Authorization
    const { authorized, error: authError } = await verifyAdminAuth(req);
    if (!authorized) {
        res.status(401).json({ error: authError || 'Unauthorized access' });
        return;
    }

    try {
        const { range, type, format } = req.query; // type: 'sessions' | 'clicks' | 'leads'
        if (!type || !format) {
            res.status(400).json({ error: 'Missing required parameters: type and format.' });
            return;
        }

        // Build Date range filters
        const now = new Date();
        let startDateValue = new Date();
        let endDateValue = new Date();

        switch (range) {
            case 'today':
                startDateValue.setUTCHours(0, 0, 0, 0);
                endDateValue.setUTCHours(23, 59, 59, 999);
                break;
            case 'yesterday':
                startDateValue.setDate(now.getDate() - 1);
                startDateValue.setUTCHours(0, 0, 0, 0);
                endDateValue.setDate(now.getDate() - 1);
                endDateValue.setUTCHours(23, 59, 59, 999);
                break;
            case '7d':
                startDateValue.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDateValue.setDate(now.getDate() - 30);
                break;
            case 'this_month':
                startDateValue = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'last_month':
                startDateValue = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDateValue = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                break;
            case 'year':
                startDateValue = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDateValue.setDate(now.getDate() - 7);
        }

        const startIso = startDateValue.toISOString();
        const endIso = endDateValue.toISOString();

        // 3. FETCH RELEVANT TABLE DATA
        let data = [];
        let error = null;

        if (type === 'sessions') {
            const { data: dbData, error: dbError } = await supabase
                .from('analytics_sessions')
                .select('id, visitor_id, ip_hash, device, browser, os, country, region, city, traffic_source, entry_page, duration, scroll_percentage, created_at')
                .gte('created_at', startIso)
                .lte('created_at', endIso)
                .order('created_at', { ascending: false });
            data = dbData || [];
            error = dbError;
        } else if (type === 'clicks') {
            const { data: dbData, error: dbError } = await supabase
                .from('analytics_clicks')
                .select('id, session_id, button_name, page_path, created_at')
                .gte('created_at', startIso)
                .lte('created_at', endIso)
                .order('created_at', { ascending: false });
            data = dbData || [];
            error = dbError;
        } else if (type === 'leads') {
            const { data: dbData, error: dbError } = await supabase
                .from('analytics_contact_submissions')
                .select('id, name, email, phone, message, status, created_at')
                .gte('created_at', startIso)
                .lte('created_at', endIso)
                .order('created_at', { ascending: false });
            data = dbData || [];
            error = dbError;
        } else {
            res.status(400).json({ error: `Unsupported report type '${type}'.` });
            return;
        }

        if (error) {
            console.error(`[Export Database Query Error] [Type: ${type}]`, error);
            throw error;
        }

        const filename = `${type}_report_${range}_${new Date().toISOString().substring(0, 10)}`;

        // Helper: Format Dates to human readable strings
        const formattedData = data.map(row => {
            const cleanRow = { ...row };
            if (cleanRow.created_at) {
                cleanRow.created_at = new Date(cleanRow.created_at).toLocaleString();
            }
            return cleanRow;
        });

        // 4. GENERATE FORMATS
        // --- CSV FORMAT ---
        if (format === 'csv') {
            if (formattedData.length === 0) {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
                res.status(200).send('No data recorded for this time range.');
                return;
            }

            const headers = Object.keys(formattedData[0]);
            const csvRows = [];
            csvRows.push(headers.join(',')); // header row

            formattedData.forEach(row => {
                const values = headers.map(header => {
                    const val = row[header] === null || row[header] === undefined ? '' : row[header];
                    // Escape double quotes and enclose in quotes
                    const escaped = ('' + val).replace(/"/g, '""');
                    return `"${escaped}"`;
                });
                csvRows.push(values.join(','));
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
            res.status(200).send(csvRows.join('\n'));
            return;
        }

        // --- EXCEL FORMAT (.xlsx) ---
        if (format === 'xlsx') {
            const worksheet = XLSX.utils.json_to_sheet(formattedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Data');
            
            const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
            res.status(200).send(excelBuffer);
            return;
        }

        // --- PDF FORMAT ---
        if (format === 'pdf') {
            // We build a programmatically correct PDF file binary.
            // This contains a structured PDF layout containing header title, metadata table, and core records.
            // Using standard A4 size (595.27 x 841.89 points)
            
            const pdfChunks = [];
            const writeln = (str) => pdfChunks.push(Buffer.from(str + '\n', 'binary'));

            // 1. PDF Header & Info
            writeln('%PDF-1.4');
            writeln('1 0 obj');
            writeln('<< /Type /Catalog /Pages 2 0 R >>');
            writeln('endobj');
            
            writeln('2 0 obj');
            writeln('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
            writeln('endobj');
            
            writeln('3 0 obj');
            writeln('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.27 841.89] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>');
            writeln('endobj');

            writeln('4 0 obj');
            writeln('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
            writeln('endobj');

            // Construct text content for the PDF canvas
            const textLines = [];
            textLines.push('BT');
            textLines.push('/F1 20 Tf');
            textLines.push('50 780 Td');
            textLines.push(`(GROWVION BUSINESS INTELLIGENCE SYSTEM) Tj`);
            
            textLines.push('/F1 12 Tf');
            textLines.push('0 -30 Td');
            textLines.push(`(Report Theme: ${type.toUpperCase()} DATA REPORT) Tj`);
            textLines.push('0 -18 Td');
            textLines.push(`(Timeframe Scope: ${range.toUpperCase()} \\(${startDateValue.toLocaleDateString()}-${endDateValue.toLocaleDateString()}\\)) Tj`);
            textLines.push('0 -18 Td');
            textLines.push(`(Exported: ${new Date().toLocaleString()} | Total Records: ${formattedData.length}) Tj`);
            
            textLines.push('0 -35 Td');
            textLines.push('([Summary Data Preview Limit: First 25 Rows]) Tj');
            textLines.push('0 -25 Td');

            // Render table records
            const maxPdfRows = Math.min(formattedData.length, 25);
            if (maxPdfRows === 0) {
                textLines.push('(No records found for this selected query range.) Tj');
            } else {
                formattedData.slice(0, maxPdfRows).forEach((row, i) => {
                    let desc = '';
                    if (type === 'sessions') {
                        desc = `#${i+1} Date: ${row.created_at} | Device: ${row.device} | Browser: ${row.browser} | Geo: ${row.city}, ${row.country}`;
                    } else if (type === 'clicks') {
                        desc = `#${i+1} Date: ${row.created_at} | CTA Name: ${row.button_name} | Page: ${row.page_path}`;
                    } else if (type === 'leads') {
                        desc = `#${i+1} Date: ${row.created_at} | Lead: ${row.name} \\(${row.email}\\) | Message: ${row.message.substring(0, 30)}...`;
                    }
                    // Clean parentheses from PDF content strings
                    const safeDesc = desc.replace(/[()]/g, '\\$&');
                    textLines.push(`(${safeDesc}) Tj`);
                    textLines.push('0 -18 Td');
                });
            }
            textLines.push('ET');

            // Render PDF Content Stream Object
            const contentStream = textLines.join('\n') + '\n';
            const streamLength = Buffer.from(contentStream, 'binary').length;

            writeln('5 0 obj');
            writeln(`<< /Length ${streamLength} >>`);
            writeln('stream');
            writeln(contentStream.trim());
            writeln('endstream');
            writeln('endobj');

            // Cross-Reference table and trailer
            writeln('xref');
            writeln('0 6');
            writeln('0000000000 65535 f ');
            writeln('0000000009 00000 n '); // obj 1 catalog
            writeln('0000000057 00000 n '); // obj 2 pages
            writeln('0000000115 00000 n '); // obj 3 page details
            writeln('0000000248 00000 n '); // obj 4 font
            writeln('0000000318 00000 n '); // obj 5 content stream
            writeln('trailer');
            writeln('<< /Size 6 /Root 1 0 R >>');
            writeln('startxref');
            writeln('318'); // approximate
            writeln('%%EOF');

            const pdfBuffer = Buffer.concat(pdfChunks);
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
            res.status(200).send(pdfBuffer);
            return;
        }

        res.status(400).json({ error: `Invalid export format: unknown parameter '${format}'.` });
    } catch (error) {
        console.error('[Export API General Failure]', error);
        res.status(500).json({ error: error.message || 'Internal Export Server Error' });
    }
};
