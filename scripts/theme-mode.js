(function initArchistraThemeMode() {
    const STORAGE_KEY = "archistra-theme-mode";
    const MODES = ["system", "light", "dark"];
    const mediaQuery =
        typeof window.matchMedia === "function"
            ? window.matchMedia("(prefers-color-scheme: dark)")
            : null;

    function normalizeMode(value) {
        return MODES.includes(value) ? value : "system";
    }

    function readStoredMode() {
        try {
            return normalizeMode(window.localStorage.getItem(STORAGE_KEY));
        } catch (_error) {
            return "system";
        }
    }

    function resolveTheme(mode) {
        if (mode === "light" || mode === "dark") return mode;
        if (!mediaQuery) return "dark";
        return mediaQuery.matches ? "dark" : "light";
    }

    function persistMode(mode) {
        try {
            window.localStorage.setItem(STORAGE_KEY, mode);
        } catch (_error) {
            // Ignore persistence failures (private mode or blocked storage).
        }
    }

    function applyMode(mode, options) {
        const settings = options || {};
        const normalizedMode = normalizeMode(mode);
        const resolved = resolveTheme(normalizedMode);
        const root = document.documentElement;

        root.dataset.themeMode = normalizedMode;
        root.dataset.theme = resolved;

        if (settings.persist) {
            persistMode(normalizedMode);
        }

        if (settings.emit) {
            window.dispatchEvent(
                new CustomEvent("archistra:theme-change", {
                    detail: { mode: normalizedMode, resolved }
                })
            );
        }

        return { mode: normalizedMode, resolved };
    }

    const ICONS = {
        system: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="11" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.8"></rect><path d="M9 19h6M12 16v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>',
        light: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"></circle><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.4 5.4l1.9 1.9M16.7 16.7l1.9 1.9M18.6 5.4l-1.9 1.9M7.3 16.7l-1.9 1.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>',
        dark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 14.8a8.3 8.3 0 1 1-11.2-11 7 7 0 1 0 11.2 11Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
    };

    function modeLabel(mode, resolved) {
        if (mode === "system") {
            return "Theme: System (" + (resolved === "dark" ? "Dark" : "Light") + ")";
        }
        return "Theme: " + (mode === "dark" ? "Dark" : "Light");
    }

    function updateToggleVisual(button, mode, resolved) {
        const icon = ICONS[mode] || ICONS.system;
        const label = modeLabel(mode, resolved);
        button.innerHTML = '<span class="theme-toggle-icon">' + icon + "</span>";
        button.setAttribute("aria-label", label);
        button.setAttribute("title", label);
        button.dataset.themeMode = mode;
        button.dataset.themeResolved = resolved;
    }

    function bindToggle(button) {
        if (!button) return null;

        const sync = () => {
            const mode = getMode();
            const resolved = getResolvedTheme();
            updateToggleVisual(button, mode, resolved);
        };

        const onClick = () => {
            cycleMode();
        };

        const onThemeChange = () => {
            sync();
        };

        button.addEventListener("click", onClick);
        window.addEventListener("archistra:theme-change", onThemeChange);
        sync();

        return function unbind() {
            button.removeEventListener("click", onClick);
            window.removeEventListener("archistra:theme-change", onThemeChange);
        };
    }

    function getMode() {
        const mode = document.documentElement.dataset.themeMode;
        return normalizeMode(mode);
    }

    function getResolvedTheme() {
        const resolved = document.documentElement.dataset.theme;
        return resolved === "light" || resolved === "dark"
            ? resolved
            : resolveTheme(getMode());
    }

    function setMode(mode) {
        return applyMode(mode, { persist: true, emit: true });
    }

    function cycleMode() {
        const mode = getMode();
        const currentIndex = MODES.indexOf(mode);
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % MODES.length : 0;
        return setMode(MODES[nextIndex]);
    }

    // Ensure attributes are in place as soon as possible.
    applyMode(readStoredMode(), { persist: false, emit: false });

    if (mediaQuery) {
        const onSystemPreferenceChanged = () => {
            if (getMode() === "system") {
                applyMode("system", { persist: false, emit: true });
            }
        };

        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", onSystemPreferenceChanged);
        } else if (typeof mediaQuery.addListener === "function") {
            mediaQuery.addListener(onSystemPreferenceChanged);
        }
    }

    window.ArchistraTheme = {
        getMode,
        getResolvedTheme,
        setMode,
        cycleMode,
        bindToggle
    };
})();
