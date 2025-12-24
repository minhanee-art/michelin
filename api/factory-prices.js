const { parse } = require('node-html-parser');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        const { stx } = req.query;
        if (!stx) return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const stx = req.method === 'POST' ? req.body.stx : req.query.stx;

    const params = new URLSearchParams();
    params.append('stx', stx || '');
    params.append('ca_id', '10');
    params.append('srch_type', 'tire');

    const cookie = process.env.BLACKCIRCLES_COOKIE || 'PHPSESSID=e0j66i422s2gfhukmng3hmjg1h; 6e1280981e1dfd9169c5dea9c28ff2e3=NTA0ODE3NDg1Mg%3D%3D; a3e94372a6379bc1ae3698dfdf38595b=NTJiYmM1MzNmMmY0OTNjNjM4YzhlMzI5N2UyNDI4ODU%3D';

    try {
        const response = await fetch('https://blackcircles.co.kr/ajax_call/shop/list_more.php', {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookie
            }
        });

        const html = await response.text();
        const root = parse(html);
        const items = root.querySelectorAll('.product_list_wrap');
        const priceMap = {};

        items.forEach(item => {
            const model = item.querySelector('.title')?.text.trim();
            const size = item.querySelector('.english_title_box span')?.text.trim();
            const priceText = item.querySelector('.sub_price')?.text.trim();

            if (model && size && priceText) {
                const cleanPrice = parseInt(priceText.replace(/[^0-9]/g, '') || '0', 10);
                const normModel = model.toLowerCase().replace(/[^a-z0-9]/g, '');
                const normSize = size.replace(/[^0-9]/g, '');
                const key = `${normModel}|${normSize}`;
                priceMap[key] = cleanPrice;
            }
        });

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        res.status(200).json(priceMap);
    } catch (error) {
        console.error('Factory Price Error:', error);
        res.status(500).json({ error: error.message });
    }
}
