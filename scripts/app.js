const canvas = document.getElementById('particles');

if (canvas instanceof HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');

    if (ctx) {
        const particleCount = 60;
        const particles = [];
        let viewportWidth = window.innerWidth;
        let viewportHeight = window.innerHeight;
        let ambientParticleColor = '96, 165, 250';
        let animationFrameId = 0;
        const reduceMotionQuery =
            typeof window.matchMedia === 'function'
                ? window.matchMedia('(prefers-reduced-motion: reduce)')
                : null;

        function parseRgbChannels(value) {
            const normalized = (value || '')
                .trim()
                .replace(/\s*,\s*/g, ' ')
                .split(/\s+/)
                .map((entry) => Number(entry))
                .filter((entry) => Number.isFinite(entry))
                .slice(0, 3)
                .map((entry) => Math.max(0, Math.min(255, Math.round(entry))));

            if (normalized.length < 3) {
                return '96, 165, 250';
            }

            return `${normalized[0]}, ${normalized[1]}, ${normalized[2]}`;
        }

        function syncAmbientColor() {
            const rootStyles = getComputedStyle(document.documentElement);
            const ambientValue = (rootStyles.getPropertyValue('--ambient-particle-rgb') || '').trim();
            const accentFallback = (rootStyles.getPropertyValue('--accent-400') || '').trim();
            ambientParticleColor = parseRgbChannels(ambientValue || accentFallback);
        }

        function resizeCanvas() {
            viewportWidth = window.innerWidth;
            viewportHeight = window.innerHeight;
            const dpr = Math.max(1, window.devicePixelRatio || 1);

            canvas.width = Math.floor(viewportWidth * dpr);
            canvas.height = Math.floor(viewportHeight * dpr);
            canvas.style.width = `${viewportWidth}px`;
            canvas.style.height = `${viewportHeight}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        class Particle {
            constructor() {
                this.x = Math.random() * viewportWidth;
                this.y = Math.random() * viewportHeight;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = Math.random() * 0.4 - 0.2;
                this.opacity = Math.random() * 0.3 + 0.2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > viewportWidth) this.x = 0;
                else if (this.x < 0) this.x = viewportWidth;

                if (this.y > viewportHeight) this.y = 0;
                else if (this.y < 0) this.y = viewportHeight;
            }

            draw() {
                ctx.fillStyle = `rgba(${ambientParticleColor}, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles.length = 0;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function connectParticles() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.strokeStyle = `rgba(${ambientParticleColor}, ${0.1 * (1 - distance / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function renderFrame(shouldUpdate) {
            ctx.clearRect(0, 0, viewportWidth, viewportHeight);

            particles.forEach((particle) => {
                if (shouldUpdate) {
                    particle.update();
                }
                particle.draw();
            });

            connectParticles();
        }

        function isReducedMotionEnabled() {
            return Boolean(reduceMotionQuery && reduceMotionQuery.matches);
        }

        function animate() {
            renderFrame(true);
            animationFrameId = window.requestAnimationFrame(animate);
        }

        function startAnimation() {
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
            }

            if (isReducedMotionEnabled()) {
                renderFrame(false);
                animationFrameId = 0;
                return;
            }

            animate();
        }

        function handleThemeChange() {
            syncAmbientColor();
            if (isReducedMotionEnabled()) {
                renderFrame(false);
            }
        }

        function handleResize() {
            resizeCanvas();
            initParticles();
            if (isReducedMotionEnabled()) {
                renderFrame(false);
            }
        }

        function handleReducedMotionChange() {
            startAnimation();
        }

        syncAmbientColor();
        resizeCanvas();
        initParticles();
        startAnimation();

        window.addEventListener('resize', handleResize);
        window.addEventListener('archistra:theme-change', handleThemeChange);

        if (reduceMotionQuery) {
            if (typeof reduceMotionQuery.addEventListener === 'function') {
                reduceMotionQuery.addEventListener('change', handleReducedMotionChange);
            } else if (typeof reduceMotionQuery.addListener === 'function') {
                reduceMotionQuery.addListener(handleReducedMotionChange);
            }
        }
    }
}

const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

// Smooth scroll for navigation
for (const anchor of document.querySelectorAll('a[href^="#"]')) {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                mobileMenuToggle?.setAttribute('aria-expanded', 'false');
            }
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}
