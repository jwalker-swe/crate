// Build out config for tailwind css

import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*./{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                textPrimary: "#FCFFFF",
                textSecondary: "#A0A6B4",
                textAccent: "",
                backgroundPrimary: "#121318",
                backgroundSecondary: "#181A1E",
                backgroundTertiary: "",
                backgroundAccent: "",
                borderPrimary: "",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};

export default config;