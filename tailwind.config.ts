import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ['"Cormorant Garamond"', '"Noto Serif JP"', "ui-serif", "Georgia", "Times New Roman", "serif"],
        display: ['"Cormorant Garamond"', '"Noto Serif JP"', "ui-serif", "Georgia", "serif"],
      },
      colors: {
        ink: {
          50: "#fafaf7",
          100: "#f4f3ee",
          200: "#e6e4dc",
          300: "#cfccc1",
          400: "#9b988b",
          500: "#6e6c61",
          600: "#4d4c45",
          700: "#33322e",
          800: "#1f1f1c",
          900: "#0d0d0c",
          950: "#050504",
        },
        // 古典的な深紫紺（kachi-iro）
        kachi: {
          50: "#eff1f7",
          100: "#d8dde9",
          200: "#aab1c8",
          300: "#7c84a6",
          400: "#525d85",
          500: "#363f63",
          600: "#222a4a",
          700: "#171c33",
          800: "#0e1222",
          900: "#080b18",
        },
        // 墨金（sumikin）— 落ち着いた金
        gold: {
          50: "#fbf7eb",
          100: "#f3ebcc",
          200: "#e7d699",
          300: "#d8bd5f",
          400: "#c5a23a",
          500: "#a78627",
          600: "#85691f",
          700: "#665018",
          800: "#473811",
          900: "#2c220a",
        },
        // 砂色（sand）— 高級感のある紙の色
        sand: {
          50: "#fbf8f1",
          100: "#f5efe1",
          200: "#ebe0c5",
          300: "#dcc99a",
          400: "#c9ad6c",
          500: "#b59148",
          600: "#967435",
          700: "#74592a",
          800: "#553f1f",
          900: "#332512",
        },
        // 朱（shu）— アクセント・警告
        shu: {
          50: "#fbeeee",
          100: "#f4cbcb",
          200: "#e89a9a",
          300: "#dc6b6b",
          400: "#c84545",
          500: "#a83333",
          600: "#852828",
          700: "#641f1f",
          800: "#431515",
          900: "#260c0c",
        },
      },
      backgroundImage: {
        "gold-fade": "linear-gradient(135deg, #fbf7eb 0%, #f5efe1 100%)",
        "kachi-fade": "linear-gradient(135deg, #0e1222 0%, #222a4a 100%)",
        "paper": "radial-gradient(circle at top right, #fbf8f1 0%, #fafaf7 100%)",
      },
      letterSpacing: {
        "wider": "0.08em",
        "widest": "0.18em",
      },
    },
  },
  plugins: [],
};

export default config;

