(function renderSharedNavbar() {
    const mountNode = document.getElementById('site-nav');
    if (!mountNode) return;

    const page = mountNode.dataset.page === 'chat' ? 'chat' : 'home';
    const isHome = page === 'home';

    const solutionsHref = isHome ? '#services' : 'index.html#services';
    const ctaHref = isHome ? '#contact' : 'index.html#contact';
    const chatHref = 'chat.html';
    const homeHref = 'index.html';

    const desktopLinks = isHome
        ? `
            <a href="${chatHref}" class="u-text-2 hover:text-accent-400 u-calm">CHAT</a>
            <a href="${solutionsHref}" class="u-text-2 hover:text-accent-400 u-calm">SOLUTIONS</a>
            <a href="${ctaHref}" class="u-text-2 hover:text-accent-400 u-calm">READY TO TRANSFORM?</a>
        `
        : `
            <a href="${homeHref}" class="u-text-2 hover:text-accent-400 u-calm">HOME</a>
            <a href="${solutionsHref}" class="u-text-2 hover:text-accent-400 u-calm">SOLUTIONS</a>
            <a href="${chatHref}" class="u-text-2 hover:text-accent-400 u-calm">CHAT</a>
        `;

    const mobileLinks = isHome
        ? `
            <a href="${chatHref}" class="block u-text-2 hover:text-accent-400 u-calm">CHAT</a>
            <a href="${solutionsHref}" class="block u-text-2 hover:text-accent-400 u-calm">SOLUTIONS</a>
            <a href="${ctaHref}" class="block u-text-2 hover:text-accent-400 u-calm">READY TO TRANSFORM?</a>
        `
        : `
            <a href="${homeHref}" class="block u-text-2 hover:text-accent-400 u-calm">HOME</a>
            <a href="${solutionsHref}" class="block u-text-2 hover:text-accent-400 u-calm">SOLUTIONS</a>
            <a href="${chatHref}" class="block u-text-2 hover:text-accent-400 u-calm">CHAT</a>
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
})();
