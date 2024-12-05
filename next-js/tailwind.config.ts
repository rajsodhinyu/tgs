import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      fontFamily: {
        bit: ['var(--font-bitcount)'],
        roc: ['var(--font-roc)'],
        title: ['var(--font-bitcount-filled)']
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors :{
        'regal-blue': '#243c5a',
        'tgs-pink': '#ed9df9',
        'tgs-purple': '#6c5cbe',
        'tgs-dark-purple': '#3D3564',
        
      }
    },
  },
  plugins: [],
};
export default config;
