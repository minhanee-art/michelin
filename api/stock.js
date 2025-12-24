const { parse } = require('node-html-parser');

export default async function handler(req, res) {
    const { stx } = req.query;

    const targetUrl = `https://blackcircles.co.kr/seller/stock_list_option.php?stx=${encodeURIComponent(stx || '')}`;
    const cookie = process.env.BLACKCIRCLES_COOKIE || 'PHPSESSID=e0j66i422s2gfhukmng3hmjg1h; 6e1280981e1dfd9169c5dea9c28ff2e3=NTA0ODE3NDg1Mg%3D%3D; a3e94372a6379bc1ae3698dfdf38595b=NTJiYmM1MzNmMmY0OTNjNjM4YzhlMzI5N2UyNDI4ODU%3D';
    const ua = process.env.BLACKCIRCLES_UA || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Cookie': cookie,
                'User-Agent': ua,
                'Accept': 'text/html'
            }
        });

        const html = await response.text();
        const root = parse(html);
        const rows = root.querySelectorAll('table.stock-list_table tr');

        if (rows.length <= 1) {
            return res.status(200).json([]);
        }

        const firstHeader = rows[0].querySelector('th, td');
        const hasCheckbox = firstHeader && (firstHeader.querySelector('input[type="checkbox"]') || firstHeader.text.trim() === '');
        const offset = hasCheckbox ? 1 : 0;
        const getIdx = (n) => (n - 1) + offset;

        const results = rows.slice(1).map(row => {
            const cols = row.querySelectorAll('td');
            if (cols.length < 5) return null;

            const statusText = cols[getIdx(15)]?.text.trim() || '';
            if (statusText.includes('단종') || row.text.includes('단종')) return null;

            const uniqueCodeCol = cols[getIdx(5)];
            const uniqueCodeInput = uniqueCodeCol?.querySelector('input');
            const uniqueCode = (uniqueCodeInput ? uniqueCodeInput.getAttribute('value') : uniqueCodeCol?.text.trim()) || '';

            let itId = '';
            let stId = '';
            row.querySelectorAll('input').forEach(input => {
                const name = input.getAttribute('name') || '';
                if (name.includes('it_id')) itId = input.getAttribute('value');
                if (name.includes('st_id')) stId = input.getAttribute('value');
            });

            const stockQty = parseInt(cols[getIdx(9)]?.text.replace(/[^0-9]/g, '') || '0', 10);
            const supplyText = cols[getIdx(10)]?.querySelector('input')?.getAttribute('value') || cols[getIdx(10)]?.text.trim() || '0';
            const supplyPrice = parseInt(supplyText.replace(/[^0-9]/g, '') || '0', 10);

            if (!uniqueCode && !itId) return null;

            return {
                brand: cols[getIdx(1)]?.text.trim() || '',
                model: cols[getIdx(2)]?.text.trim() || '',
                size: cols[getIdx(4)]?.text.trim() || '',
                partNo: uniqueCode,
                itId: itId,
                stId: stId,
                internalCode: cols[getIdx(3)]?.text.trim() || '',
                supplyPrice: supplyPrice,
                totalStock: stockQty
            };
        }).filter(item => item !== null);

        // Deduplicate
        const uniqueResults = [];
        const seen = new Set();
        results.forEach(item => {
            const key = `${item.brand}-${item.model}-${item.size}-${item.partNo}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueResults.push(item);
            }
        });

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        res.status(200).json(uniqueResults);
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: error.message });
    }
}
