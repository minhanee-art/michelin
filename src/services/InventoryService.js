class InventoryService {
    constructor() {
        this.products = [];
        this.inventory = [];
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;
    }

    /**
     * Fetch items from the server-side proxy which returns JSON.
     * Fallback to local HTML parsing for dev environment parity.
     */
    async fetchShopItems(sizeSearch = '') {
        try {
            let url = '/api/stock';
            if (sizeSearch) {
                url += `?stx=${encodeURIComponent(sizeSearch)}`;
            }

            console.log(`[Stock Fetch] URL: ${url}`);
            const response = await fetch(url);

            if (!response.ok) throw new Error('Network response was not ok');

            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const data = await response.json();
                console.log(`[Stock Fetch] Received ${data.length} items as JSON.`);
                return data;
            } else {
                // Local dev fallback (receives HTML)
                const text = await response.text();
                console.log(`[Stock Fetch] Received HTML, parsing locally...`);
                return this.parseShopData(text);
            }
        } catch (err) {
            console.warn("Stock fetch failed:", err);
            return [];
        }
    }

    /**
     * Fetch factory prices from the server-side proxy which returns JSON.
     * Fallback to local HTML parsing for dev environment parity.
     */
    async fetchFactoryPrices(sizeSearch) {
        try {
            const response = await fetch('/api/factory-prices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ stx: sizeSearch })
            });

            if (!response.ok) return {};

            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                return await response.json();
            } else {
                // Local dev fallback (receives HTML)
                const html = await response.text();
                return this.parseLocalFactoryPrices(html);
            }
        } catch (error) {
            console.error("Failed to fetch shop prices:", error);
            return {};
        }
    }

    parseShopData(responseBody) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(responseBody, 'text/html');
        const rows = Array.from(doc.querySelectorAll('table.stock-list_table tr'));

        if (rows.length === 0) return [];

        const getValue = (col) => {
            if (!col) return '';
            const input = col.querySelector('input[type="text"]');
            if (input) return input.value.trim();
            return col.textContent.trim();
        };

        const getText = (col) => col ? col.textContent.trim() : '';
        const firstHeader = rows[0].querySelector('th, td');
        const hasCheckbox = firstHeader && (firstHeader.querySelector('input[type="checkbox"]') || getText(firstHeader) === '');
        const offset = hasCheckbox ? 1 : 0;
        const getIdx = (n) => (n - 1) + offset;

        const parsedItems = rows.slice(1).map((row) => {
            const cols = Array.from(row.querySelectorAll('td'));
            if (cols.length < 5) return null;

            const statusText = getText(cols[getIdx(15)]);
            if (statusText.includes('단종') || row.textContent.includes('단종')) return null;

            const uniqueCodeCol = cols[getIdx(5)];
            const uniqueCodeInput = uniqueCodeCol ? uniqueCodeCol.querySelector('input') : null;
            const uniqueCode = (uniqueCodeInput ? uniqueCodeInput.value : getText(uniqueCodeCol)).trim();

            let itId = '';
            let stId = '';
            row.querySelectorAll('input').forEach(input => {
                const name = input.name || '';
                if (name.includes('it_id')) itId = input.value.trim();
                if (name.includes('st_id')) stId = input.value.trim();
            });

            const stockQty = Number(getText(cols[getIdx(9)]).replace(/[^0-9]/g, '')) || 0;
            const supplyPrice = Number(getValue(cols[getIdx(10)]).replace(/[^0-9]/g, '')) || 0;

            if (!uniqueCode && !itId) return null;

            return {
                brand: getText(cols[getIdx(1)]),
                model: getText(cols[getIdx(2)]),
                size: getText(cols[getIdx(4)]),
                partNo: uniqueCode,
                itId: itId,
                stId: stId,
                internalCode: getText(cols[getIdx(3)]),
                supplyPrice: supplyPrice,
                totalStock: stockQty
            };
        }).filter(item => item !== null);

        // Deduplicate
        const uniqueItems = [];
        const seen = new Set();
        parsedItems.forEach(item => {
            const key = `${item.brand}-${item.model}-${item.size}-${item.partNo}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueItems.push(item);
            }
        });

        return uniqueItems;
    }

    parseLocalFactoryPrices(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const items = doc.querySelectorAll('.product_list_wrap');
        const priceMap = {};

        items.forEach(item => {
            const model = item.querySelector('.title')?.textContent?.trim();
            const size = item.querySelector('.english_title_box span')?.textContent?.trim();
            const priceText = item.querySelector('.sub_price')?.textContent?.trim();

            if (model && size && priceText) {
                const cleanPrice = Number(priceText.replace(/[^0-9]/g, ''));
                const normModel = model.toLowerCase().replace(/[^a-z0-9]/g, '');
                const normSize = size.replace(/[^0-9]/g, '');
                const key = `${normModel}|${normSize}`;
                priceMap[key] = cleanPrice;
            }
        });
        return priceMap;
    }
}

export const inventoryService = new InventoryService();
