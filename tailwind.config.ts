import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neuBg: '#f0f5f1',       // Very light green-tinted off-white
        neuGreen: '#2e7d32',    // Primary deep green
        neuGreenLight: '#4ade80', // Accent green
        neuDark: '#1a3320',     // Dark text color
      },
      boxShadow: {
        // Outer shadows for raised elements
        'neu': '9px 9px 16px #d1d9d3, -9px -9px 16px #ffffff',
        'neu-sm': '5px 5px 10px #d1d9d3, -5px -5px 10px #ffffff',
        // Inset shadows for pressed states and inputs
        'neu-inset': 'inset 6px 6px 10px #d1d9d3, inset -6px -6px 10px #ffffff',
      }
    },
  },
  plugins: [],
};
export default config;
