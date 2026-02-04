/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'handwritten': ['"Nanum Pen Script"', 'cursive'],
                'mono-display': ['"Major Mono Display"', 'monospace'],
                'sans': ['Montserrat', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
