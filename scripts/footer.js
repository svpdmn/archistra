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
                            <li><a href="${chatHref}" class="u-text-2 hover:text-accent-400 u-calm">FAQ</a></li>
                            <li><span class="u-text-2">Templates</span></li>
                            <li><a href="${contactHref}" class="u-text-2 hover:text-accent-400 u-calm">Support</a></li>
                        </ul>
                    </div>
                </div>

                <div class="border-t u-border-subtle pt-8">
                    <div class="flex flex-col gap-6">
                        <div class="flex flex-col gap-4 items-center">
                            <nav aria-label="Social media links" class="flex flex-wrap items-center justify-center gap-4 text-xs font-alt">
                                <a href="https://discord.gg/SZ9PXJfG" target="_blank" rel="noopener noreferrer" aria-label="Discord" class="u-text-2 hover:text-accent-400 u-calm inline-flex h-8 w-8 items-center justify-center">
                                    <svg class="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                                        <path d="M20.3 4.37A19.8 19.8 0 0 0 15.9 3c-.2.35-.43.82-.58 1.2a18.4 18.4 0 0 0-5.63 0c-.16-.38-.4-.85-.59-1.2a19.7 19.7 0 0 0-4.4 1.37C1.9 8.6 1.18 12.74 1.54 16.82A19.9 19.9 0 0 0 7.45 19.8c.47-.65.9-1.35 1.25-2.09-.7-.27-1.36-.6-1.98-.99.16-.12.32-.24.47-.37 3.8 1.78 7.91 1.78 11.66 0 .16.13.32.25.48.37-.62.4-1.3.72-2 .99.36.74.78 1.43 1.26 2.09a19.8 19.8 0 0 0 5.9-2.98c.42-4.73-.72-8.83-3.18-12.45ZM9.53 14.32c-1.15 0-2.1-1.05-2.1-2.34 0-1.3.93-2.34 2.1-2.34 1.17 0 2.12 1.05 2.1 2.34 0 1.3-.93 2.34-2.1 2.34Zm4.94 0c-1.16 0-2.1-1.05-2.1-2.34 0-1.3.93-2.34 2.1-2.34 1.17 0 2.12 1.05 2.1 2.34 0 1.3-.93 2.34-2.1 2.34Z"></path>
                                    </svg>
                                </a>
                                <a href="https://www.linkedin.com/in/archistraAI" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="u-text-2 hover:text-accent-400 u-calm inline-flex h-8 w-8 items-center justify-center">
                                    <svg class="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                                        <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.84-2.05 3.79-2.05 4.05 0 4.8 2.67 4.8 6.13V21h-4v-5.4c0-1.3-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.86V21h-4V9Z"></path>
                                    </svg>
                                </a>
                                <a href="https://x.com/archistraAI" target="_blank" rel="noopener noreferrer" aria-label="X" class="u-text-2 hover:text-accent-400 u-calm inline-flex h-8 w-8 items-center justify-center">
                                    <svg class="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                                        <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-5-6.6L6 22H2.8l7.2-8.2L.8 2h6.4l4.5 6 5.2-6Z"></path>
                                    </svg>
                                </a>
                                <a href="https://youtube.com/@archistraAI" target="_blank" rel="noopener noreferrer" aria-label="YouTube" class="u-text-2 hover:text-accent-400 u-calm inline-flex h-8 w-8 items-center justify-center">
                                    <svg class="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                                        <path d="M23.5 7.2a3 3 0 0 0-2.1-2.1C19.5 4.5 12 4.5 12 4.5s-7.5 0-9.4.6a3 3 0 0 0-2.1 2.1A31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-4.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z"></path>
                                    </svg>
                                </a>
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
