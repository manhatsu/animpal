// Use ESM (ECMAScript Module) style import, not require()
// Make sure your package.json includes: "type": "module"

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'neutral-950': '#0a0a0a',
        'neutral-900': '#18181b',
        'neutral-800': '#27272a',
        border: 'hsl(240, 10%, 50%)',
        input: 'hsl(240, 3.7%, 15.9%)',
        ring: 'hsl(240, 4.9%, 83.9%)',
        background: 'hsl(240, 10%, 3.9%)',
        foreground: 'hsl(0, 0%, 98%)',
        primary: {
          DEFAULT: 'hsl(0, 0%, 98%)',
          foreground: 'hsl(240, 5.9%, 10%)',
        },
        secondary: {
          DEFAULT: 'hsl(240, 3.7%, 15.9%)',
          foreground: 'hsl(0, 0%, 98%)',
        },
        destructive: {
          DEFAULT: 'hsl(0, 62.8%, 30.6%)',
          foreground: 'hsl(0, 0%, 98%)',
        },
        muted: {
          DEFAULT: 'hsl(240, 3.7%, 15.9%)',
          foreground: 'hsl(240, 5%, 64.9%)',
        },
        accent: {
          DEFAULT: 'hsl(240, 3.7%, 15.9%)',
          foreground: 'hsl(0, 0%, 98%)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '"Noto Sans JP"',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl: '1rem',
      },
      boxShadow: {
        soft: '0 4px 24px 0 rgba(0,0,0,0.07)',
      },
    },
  },
  plugins: [],
}

export default config 