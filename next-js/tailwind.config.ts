import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
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
        'tgs-pink': '#FFA6F2',
        'tgs-purple': '#6B5DB0',
        'tgs-dark-purple': '#3D3564',
      }
    },
  },
  plugins: [],
};
export default config;
