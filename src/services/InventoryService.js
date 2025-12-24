class InventoryService {
    constructor() {
        this.products = [];
        this.inventory = [];
        this.initialized = false;
    }

    init() {
        // Mock data initialization (can be removed if not used)
        if (this.initialized) return;
        this.initialized = true;
    }

    /**
     * Fetch items from the server-side proxy which returns JSON.
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
            const data = await response.json();

            console.log(`[Stock Fetch] Received ${data.length} items as JSON.`);
            return data;
        } catch (err) {
            console.warn("Stock fetch failed:", err);
            return [];
        }
    }

    /**
     * Fetch factory prices from the server-side proxy which returns JSON.
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
            const priceMap = await response.json();
            return priceMap;
        } catch (error) {
            console.error("Failed to fetch shop prices:", error);
            return {};
        }
    }
}

export const inventoryService = new InventoryService();
