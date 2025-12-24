import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 8080,
        proxy: {
            '/api/stock': {
                target: 'https://blackcircles.co.kr',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/stock/, '/seller/stock_list_option.php'),
                secure: false,
                headers: {
                    'Cookie': 'PHPSESSID=e0j66i422s2gfhukmng3hmjg1h; 6e1280981e1dfd9169c5dea9c28ff2e3=NTA0ODE3NDg1Mg%3D%3D; a3e94372a6379bc1ae3698dfdf38595b=NTJiYmM1MzNmMmY0OTNjNjM4YzhlMzI5N2UyNDI4ODU%3D',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            },
            '/api/factory-prices': {
                target: 'https://blackcircles.co.kr',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/factory-prices/, '/ajax_call/shop/list_more.php'),
                secure: false,
                headers: {
                    'Cookie': 'PHPSESSID=e0j66i422s2gfhukmng3hmjg1h; 6e1280981e1dfd9169c5dea9c28ff2e3=NTA0ODE3NDg1Mg%3D%3D; a3e94372a6379bc1ae3698dfdf38595b=NTJiYmM1MzNmMmY0OTNjNjM4YzhlMzI5N2UyNDI4ODU%3D',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            },
            '/api/sheet-data': {
                target: 'https://docs.google.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/sheet-data/, '/spreadsheets/d/e/2PACX-1vTHpRh8_kaiBQQaXE0i8nz2tH8uAwm1I1oS6hHQF87C5-LrlDcNTbRKN5xCVeEtbgro8pA2LAjRgT8V/pub?gid=903841373&single=true&output=csv'),
                secure: false
            },
        },
    },
});
