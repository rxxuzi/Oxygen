/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
    "./src/renderer/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "Monaco", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in-up": {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "processing-pulse": {
          "0%, 60%, 100%": { opacity: 0.3, transform: "scale(0.8)" },
          "30%": { opacity: 1, transform: "scale(1.2)" },
        },
        "toast-slide-up": {
          from: { opacity: 0, transform: "translateX(-50%) translateY(20px)" },
          to: { opacity: 1, transform: "translateX(-50%) translateY(0)" },
        },
        "toast-slide-down": {
          from: { opacity: 1, transform: "translateX(-50%) translateY(0)" },
          to: { opacity: 0, transform: "translateX(-50%) translateY(20px)" },
        },
        "paste-dialog-slide-in": {
          from: { opacity: 0, transform: "translateX(-50%) translateY(-12px)" },
          to: { opacity: 1, transform: "translateX(-50%) translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in-up-fast": "fade-in-up 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards",
        shimmer: "shimmer 2s infinite",
        "processing-pulse": "processing-pulse 1.4s ease-in-out infinite",
        "toast-slide-up": "toast-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "toast-slide-down": "toast-slide-down 0.2s ease-in forwards",
        "paste-dialog-slide-in": "paste-dialog-slide-in 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};