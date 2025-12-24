let cachedSheetData = null;
let lastFetchTime = 0;
const CACHE_TTL = 1 * 60 * 1000; // 1 minute cache in memory

/**
 * Service to fetch Data (Price, DOT, Info) via server-side proxy
 */
export const googleSheetService = {
    fetchSheetData: async (forceRefresh = false) => {
        const now = Date.now();
        if (!forceRefresh && cachedSheetData && (now - lastFetchTime < CACHE_TTL)) {
            console.log('Serving tire info from cache');
            return cachedSheetData;
        }

        try {
            console.log('Fetching tire info from server...');
            const response = await fetch('/api/sheet-data');

            if (!response.ok) throw new Error('Failed to fetch sheet data');

            const data = await response.json();

            cachedSheetData = data;
            lastFetchTime = Date.now();

            return data;
        } catch (error) {
            console.error('Error fetching tire info:', error);
            if (cachedSheetData) return cachedSheetData;
            return [];
        }
    }
};
