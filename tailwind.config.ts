import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de Cores TCC
        turquoise: {
          DEFAULT: '#00C2A8',
          50: '#E6F9F6',
          100: '#CCF3ED',
          200: '#99E7DB',
          300: '#66DBC9',
          400: '#33CFB7',
          500: '#00C2A8',
          600: '#009B86',
          700: '#007465',
          800: '#004D43',
          900: '#002622',
        },
        'dark-blue': {
          DEFAULT: '#003B4A',
          50: '#E6F0F2',
          100: '#CCE1E5',
          200: '#99C3CB',
          300: '#66A5B1',
          400: '#338797',
          500: '#003B4A',
          600: '#002F3B',
          700: '#00232C',
          800: '#00171D',
          900: '#000B0E',
        },
        'light-green': {
          DEFAULT: '#A7F0E0',
          50: '#F0FDFA',
          100: '#E1FBEF',
          200: '#C3F7DF',
          300: '#A5F3CF',
          400: '#87EFBF',
          500: '#A7F0E0',
          600: '#85C0B0',
          700: '#639080',
          800: '#416050',
          900: '#1F4020',
        },
        coral: {
          DEFAULT: '#FF7043',
          50: '#FFF4F1',
          100: '#FFE9E3',
          200: '#FFD3C7',
          300: '#FFBDAB',
          400: '#FFA78F',
          500: '#FF7043',
          600: '#CC5936',
          700: '#994228',
          800: '#662B1B',
          900: '#33140D',
        },
        // Cores Neutras
        white: '#FFFFFF',
        lightGray: '#F5F7F8',
        mediumGray: '#4A5568',
        darkGray: '#1A202C',
        // Cores do sistema baseadas na paleta
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
