const path = require('path');

module.exports = {
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./lib/**/*.{ts,tsx}",
    ],
    safelist: [
        "bg-red-500", // For testing
        "bg-blue-600",
        "bg-gray-100",
        "bg-accent",
        "text-slate-900",
        "text-white",
        "rounded-tl-none",
        "rounded-tr-none",
        "rounded-2xl",
        "justify-start",
        "justify-end",
        "min-h-screen",
        "font-sans",
        "antialiased",
        "bg-background",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
