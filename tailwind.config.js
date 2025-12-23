/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                michelinBlue: '#004F9F',
                michelinYellow: '#FFD500',
                slate: {
                    850: '#1e293b',
                    900: '#0f172a',
                }
            }
        },
    },
    plugins: [],
}
