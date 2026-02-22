(function renderSharedFooter() {
    const mountNode = document.getElementById("site-footer");
    if (!mountNode) return;

    const homeHref = "/";
    const aboutHref = "/about.html";
    const securityHref = "/security.html";
    const contactHref = "/contact.html";
    const chatHref = "/chat.html";
    const privacyHref = "/privacy.html";
    const termsHref = "/terms.html";

    mountNode.innerHTML = `
        <footer class="relative border-t u-border-subtle py-12 md:py-16 px-4 sm:px-6" style="z-index: 2;">
            <div class="max-w-7xl mx-auto">
                <div class="grid gap-8 sm:grid-cols-2 mb-12 max-w-4xl mx-auto items-center justify-items-center">
                    <div class="w-full max-w-xs flex flex-col items-center justify-center text-center">
                        <h4 class="font-bold mb-4 font-alt text-[11px] u-text-3 tracking-[0.18em]">COMPANY</h4>
                        <ul class="space-y-2 text-xs font-alt">
                            <li><a href="${aboutHref}" class="u-text-2 hover:text-accent-400 u-calm">About</a></li>
                            <li><a href="${contactHref}" class="u-text-2 hover:text-accent-400 u-calm">Contact</a></li>
                            <li><a href="${securityHref}" class="u-text-2 hover:text-accent-400 u-calm">Security</a></li>
                        </ul>
                    </div>

                    <div class="w-full max-w-xs flex flex-col items-center justify-center text-center">
                        <h4 class="font-bold mb-4 font-alt text-[11px] u-text-3 tracking-[0.18em]">RESOURCES</h4>
                        <ul class="space-y-2 text-xs font-alt">
                            <li><a href="${chatHref}" class="u-text-2 hover:text-accent-400 u-calm">Chat Workspace</a></li>
                            <li><a href="${aboutHref}" class="u-text-2 hover:text-accent-400 u-calm">Overview</a></li>
                            <li><a href="${contactHref}" class="u-text-2 hover:text-accent-400 u-calm">Support</a></li>
                        </ul>
                    </div>
                </div>

                <div class="border-t u-border-subtle pt-8">
                    <div class="flex flex-col gap-6">
                        <div class="flex flex-col gap-4 items-center">
                            <nav aria-label="Social media links" class="flex flex-wrap items-center justify-center gap-4 text-xs font-alt">
                                <a href="https://discord.gg/SZ9PXJfG" target="_blank" rel="noopener noreferrer" class="u-text-2 hover:text-accent-400 u-calm">Discord</a>
                                <a href="https://www.linkedin.com/in/archistraAI" target="_blank" rel="noopener noreferrer" class="u-text-2 hover:text-accent-400 u-calm">LinkedIn</a>
                                <a href="https://x.com/archistraAI" target="_blank" rel="noopener noreferrer" class="u-text-2 hover:text-accent-400 u-calm">X</a>
                                <a href="https://youtube.com/@archistraAI" target="_blank" rel="noopener noreferrer" class="u-text-2 hover:text-accent-400 u-calm">YouTube</a>
                            </nav>

                            <div aria-hidden="true" class="h-4"></div>

                            <nav aria-label="Legal links" class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-alt">
                                <a href="${privacyHref}" class="u-text-2 hover:text-accent-400 u-calm">Privacy</a>
                                <a href="${termsHref}" class="u-text-2 hover:text-accent-400 u-calm">Terms &amp; Conditions</a>
                                <a href="${securityHref}" class="u-text-2 hover:text-accent-400 u-calm">Security</a>
                            </nav>
                        </div>

                        <div class="flex flex-col items-center text-center">
                            <a href="${homeHref}" class="flex flex-col items-center justify-center gap-2 mb-2" aria-label="Archistra home">
                                <img src="assets/archistra-logo.svg" alt="Archistra logo" class="w-10 h-10" />
                                <span class="text-2xl font-semibold font-display">archistra</span>
                            </a>
                            <p class="u-text-3 text-xs">[built on first principles]</p>
                        </div>

                        <div class="u-text-3 text-xs font-alt text-center opacity-50">
                            © 2026 archistra. all rights reserved.
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    `;
})();
