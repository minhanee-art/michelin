import Papa from 'papaparse';

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTHpRh8_kaiBQQaXE0i8nz2tH8uAwm1I1oS6hHQF87C5-LrlDcNTbRKN5xCVeEtbgro8pA2LAjRgT8V/pub?gid=903841373&single=true&output=csv';

export default async function handler(req, res) {
    try {
        const response = await fetch(GOOGLE_SHEET_CSV_URL);
        const csvText = await response.text();

        // Wrap Papa.parse in a Promise to ensure the handler awaits the results
        const parsedData = await new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const data = results.data.map(row => {
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
                            factoryPrice: parseInt(price, 10),
                            dotList: dotList,
                            cai: cai
                        };
                    });
                    resolve(data);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
        res.status(200).json(parsedData);
    } catch (error) {
        console.error('Sheet Data Error:', error);
        res.status(500).json({ error: error.message });
    }
}
