const archistraTailwindConfig = {
    theme: {
        extend: {
            fontFamily: {
                sans: ["Geo", "sans-serif"],
                display: ["Tektur", "sans-serif"],
                mono: ["Space Mono", "monospace"],
                alt: ["Play", "sans-serif"],
            },
            colors: {
                bg: {
                    0: "#0B1220",
                    1: "#0F1B2D",
                },
                surface: {
                    0: "#121F33",
                    1: "#162844",
                },
                accent: {
                    200: "#BFDBFE",
                    400: "#60A5FA",
                    500: "#3B82F6",
                },
                success: "#22C55E",
                warning: "#F59E0B",
                danger: "#EF4444",
                ink: {
                    1: "rgb(255 255 255)",
                },
            },
            borderRadius: {
                sm: "10px",
                md: "14px",
                lg: "18px",
                xl2: "22px",
            },
            boxShadow: {
                e1: "0 8px 24px rgba(0,0,0,0.35)",
                e2: "0 16px 48px rgba(0,0,0,0.45)",
                e3: "0 24px 80px rgba(0,0,0,0.55)",
                highlight: "inset 0 1px 0 rgba(255,255,255,0.08)",
            },
            backdropBlur: {
                glass: "12px",
                "glass-strong": "20px",
            },
            transitionTimingFunction: {
                calm: "cubic-bezier(0.2, 0.8, 0.2, 1)",
            },
            transitionDuration: {
                calm: "180ms",
                panel: "260ms",
            },
        },
    },
};

window.tailwind = window.tailwind || {};
window.tailwind.config = archistraTailwindConfig;

if (typeof tailwind !== "undefined") {
    tailwind.config = archistraTailwindConfig;
    if (typeof tailwind.refresh === "function") {
        tailwind.refresh();
    }
}
