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
        //Icon Colors
        fileRed: "#C71408",
        fileOrange: "#C76408",
        fileBlue: "#0877C7",
        fileLightTeal: "#08C79A",
        fileGreen: "#0CC708",

        //Accents
        accentPrimary: "#00A3FF",
        accentSecondary: "#03ADAE",

        //BG
        bgPrimary: "#1A111F",
        bgSecondary: "#130E16",

        //Text
        textPrimary: "#FFFFFF",
        textSecondary: "#BFBFBF",
      },
    },
  },
  plugins: [],
};
export default config;
