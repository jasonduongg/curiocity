import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // TODO: add more colors, fonts, etc as needed
  theme: {
    extend: {
      colors: {
        wdbBlue: "#0d6efd",
      },
    },
  },
  plugins: [],
};
export default config;
