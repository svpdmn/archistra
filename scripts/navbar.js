(async function renderSharedNavbar() {
    const mountNode = document.getElementById("site-nav");
    if (!mountNode) return;

    const homeHref = "/";
    const aboutHref = "/about";
    const securityHref = "/security";
    const contactHref = "/contact";
    const chatHref = "/chat";
    const authLoginHref = "/auth/login?returnTo=/chat";

    const authUi = window.ArchistraAuthUi;
    const authState = authUi ? await authUi.fetchAuthState() : { isAuthenticated: false, email: null, orgId: null, orgName: null, roles: [] };
    const accountLabel = authUi ? authUi.formatAccountLabel(authState) : "ACCOUNT";
    const orgLabel = authState.orgName || authState.orgId || "No Org";

    const authDesktopSlot = authState.isAuthenticated
        ? `
            <div class="relative" id="desktop-auth-container">
                <button
                    id="desktop-auth-toggle"
                    type="button"
                    class="btn btn-primary btn-size-nav auth-chip u-font-code"
                    aria-expanded="false"
                    aria-controls="desktop-auth-menu"
                >
                    ${accountLabel}
                </button>
                <div id="desktop-auth-menu" class="auth-menu card hidden" role="menu">
                    <p class="auth-menu-meta u-text-3 u-font-code">${authState.email || "No email"}</p>
                    <p class="auth-menu-meta u-text-3 u-font-code">Org: ${orgLabel}</p>
                    <a href="/chat" class="auth-menu-item" role="menuitem">Continue to Chat</a>
                    <a href="/auth/logout" class="auth-menu-item" role="menuitem">Log Out</a>
                </div>
            </div>
        `
        : `<a href="${authLoginHref}" class="btn btn-primary btn-size-nav font-semibold u-font-code">SIGN UP</a>`;

    const authMobileSlot = authState.isAuthenticated
        ? `
            <div class="space-y-2">
                <button
                    id="mobile-auth-toggle"
                    type="button"
                    class="inline-flex items-center justify-center btn btn-primary btn-size-nav auth-chip u-font-code"
                    aria-expanded="false"
                    aria-controls="mobile-auth-menu"
                >
                    ${accountLabel}
                </button>
                <div id="mobile-auth-menu" class="auth-menu card hidden" role="menu">
                    <p class="auth-menu-meta u-text-3 u-font-code">${authState.email || "No email"}</p>
                    <p class="auth-menu-meta u-text-3 u-font-code">Org: ${orgLabel}</p>
                    <a href="/chat" class="auth-menu-item" role="menuitem">Continue to Chat</a>
                    <a href="/auth/logout" class="auth-menu-item" role="menuitem">Log Out</a>
                </div>
            </div>
        `
        : `<a href="${authLoginHref}" class="inline-flex items-center justify-center btn btn-primary btn-size-nav font-semibold u-font-code">SIGN UP</a>`;

    const desktopLinks = `
        <a href="${homeHref}" class="u-text-2 hover:text-accent-400 u-calm">HOME</a>
        <a href="${aboutHref}" class="u-text-2 hover:text-accent-400 u-calm">ABOUT</a>
        <a href="${securityHref}" class="u-text-2 hover:text-accent-400 u-calm">SECURITY</a>
        <a href="${contactHref}" class="u-text-2 hover:text-accent-400 u-calm">CONTACT</a>
        <a href="${chatHref}" class="u-text-2 hover:text-accent-400 u-calm">CHAT</a>
        ${authDesktopSlot}
    `;

    const mobileLinks = `
        <a href="${homeHref}" class="block u-text-2 hover:text-accent-400 u-calm">HOME</a>
        <a href="${aboutHref}" class="block u-text-2 hover:text-accent-400 u-calm">ABOUT</a>
        <a href="${securityHref}" class="block u-text-2 hover:text-accent-400 u-calm">SECURITY</a>
        <a href="${contactHref}" class="block u-text-2 hover:text-accent-400 u-calm">CONTACT</a>
        <a href="${chatHref}" class="block u-text-2 hover:text-accent-400 u-calm">CHAT</a>
        ${authMobileSlot}
    `;

    mountNode.innerHTML = `
        <nav class="fixed w-full top-0 z-50" style="background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div class="flex items-center">
                        <a href="${homeHref}" class="text-xl sm:text-2xl font-semibold font-display logo-glow">archistra</a>
                    </div>

                    <div class="flex justify-center">
                        <a href="${homeHref}" aria-label="Archistra home">
                            <img src="assets/archistra-logo.svg" alt="Archistra logo" class="w-9 h-9 sm:w-10 sm:h-10" />
                        </a>
                    </div>

                    <div class="flex items-center justify-end">
                        <button
                            id="mobile-menu-toggle"
                            type="button"
                            class="md:hidden inline-flex items-center justify-center rounded-none p-2 text-white/80 border border-white/20 bg-white/5 hover:bg-white/10 u-calm"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                            aria-label="Toggle navigation menu"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>

                        <div class="hidden md:flex items-center justify-end gap-8 font-alt text-xs tracking-wider">
                            ${desktopLinks}
                        </div>
                    </div>
                </div>

                <div id="mobile-menu" class="md:hidden hidden mt-3 rounded-md card p-4 space-y-3 font-alt text-xs tracking-wider">
                    ${mobileLinks}
                </div>
            </div>
        </nav>
    `;

    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener("click", () => {
            const isExpanded = mobileMenuToggle.getAttribute("aria-expanded") === "true";
            mobileMenu.classList.toggle("hidden");
            mobileMenuToggle.setAttribute("aria-expanded", String(!isExpanded));
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth >= 768) {
                mobileMenu.classList.add("hidden");
                mobileMenuToggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    function wireAuthMenu(toggleId, menuId) {
        const toggle = document.getElementById(toggleId);
        const menu = document.getElementById(menuId);
        if (!toggle || !menu) return;

        const closeMenu = () => {
            menu.classList.add("hidden");
            toggle.setAttribute("aria-expanded", "false");
        };

        toggle.addEventListener("click", () => {
            const isExpanded = toggle.getAttribute("aria-expanded") === "true";
            menu.classList.toggle("hidden");
            toggle.setAttribute("aria-expanded", String(!isExpanded));
        });

        document.addEventListener("click", (event) => {
            const target = event.target;
            if (!menu.classList.contains("hidden") && !menu.contains(target) && !toggle.contains(target)) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMenu();
                toggle.focus();
            }
        });
    }

    wireAuthMenu("desktop-auth-toggle", "desktop-auth-menu");
    wireAuthMenu("mobile-auth-toggle", "mobile-auth-menu");
})();
