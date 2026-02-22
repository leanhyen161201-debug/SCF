import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false, // Disable to prevent Ant Design conflicts
  },
  theme: {
    extend: {
      colors: {
        primary: '#1677ff',
        success: '#52c41a',
        warning: '#faad14',
        danger: '#ff4d4f',
      },
    },
  },
  plugins: [],
} satisfies Config;
