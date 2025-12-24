import Papa from 'papaparse';

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

            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const data = await response.json();
                cachedSheetData = data;
                lastFetchTime = Date.now();
                return data;
            } else {
                // Local dev fallback (receives CSV)
                const csvText = await response.text();
                return new Promise((resolve, reject) => {
                    Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            const parsedData = results.data.map(row => {
                                const code = row['code'] ? String(row['code']).trim() : '';
                                const size = row['size'] ? String(row['size']).trim() : '';
                                const brand = row['brand'] ? String(row['brand']).trim() : '';
                                const model = row['model'] ? String(row['model']).trim() : '';
                                const price = row['factory price'] ? row['factory price'].replace(/[^0-9]/g, '') : '0';
                                const cai = row['cai'] ? String(row['cai']).trim() : '';

                                const dotList = [];
                                Object.keys(row).forEach(key => {
                                    if (key.includes('#')) {
                                        const val = row[key] ? row[key].trim() : '';
                                        const label = key.replace('DOT ', '').trim();
                                        if (val && val !== '0' && val !== '-') {
                                            dotList.push(`${label}: ${val}`);
                                        }
                                    }
                                });

                                return {
                                    code: code,
                                    size: size,
                                    brand: brand,
                                    model: model,
                                    factoryPrice: Number(price),
                                    dotList: dotList,
                                    cai: cai
                                };
                            });

                            cachedSheetData = parsedData;
                            lastFetchTime = Date.now();
                            resolve(parsedData);
                        },
                        error: (error) => reject(error)
                    });
                });
            }
        } catch (error) {
            console.error('Error fetching tire info:', error);
            if (cachedSheetData) return cachedSheetData;
            return [];
        }
    }
};
