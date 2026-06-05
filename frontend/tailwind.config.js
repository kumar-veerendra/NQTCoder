/** @type {import('tailwindcss').Config} */
export default {
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
        brandTcs: '#1e40af',    
        gradientFrom: 'var(--color-hero-gradient-from)',
        gradientVia: 'var(--color-hero-gradient-via)',
      }
    },
  },
  plugins: [],
}
