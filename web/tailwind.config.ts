import type { Config } from "tailwindcss";

export default {

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        secondary: "var(--secondary)",
        tertiary: "var(--tertiary)",
        success: "var(--success)",
        warning: "var(--warning)",
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"], 
      },
    },
  },
  plugins: [],
} satisfies Config;
