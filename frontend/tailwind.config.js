/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: 'rgb(var(--color-bg-rgb) / <alpha-value>)',      
        darkCard: 'rgb(var(--color-card-rgb) / <alpha-value>)',    
        darkBorder: 'rgb(var(--color-border-rgb) / <alpha-value>)',  
        accentBlue: '#6366F1',  
        accentBlueHover: '#4f46e5',
        accentBtn: '#6366F1',
        accentBtnHover: '#4f46e5',
        brandTcs: '#1e40af',    
        gradientFrom: 'var(--color-hero-gradient-from)',
        gradientVia: 'var(--color-hero-gradient-via)',
      }
    },
  },
  plugins: [],
}
