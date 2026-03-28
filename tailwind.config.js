/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'display': ['"Space Grotesk"', 'sans-serif'],
                'sans': ['Inter', 'sans-serif'],
            },
            colors: {
                surface: {
                    DEFAULT: '#0a0a0f',
                    light: '#12121a',
                    lighter: '#1a1a25',
                },
                accent: {
                    DEFAULT: '#4ade80',
                    dim: 'rgba(74, 222, 128, 0.15)',
                },
                muted: '#6b6b80',
            },
        },
    },
    plugins: [],
}
