"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
};

const PARTICLE_COUNT = 60;
const DEFAULT_AMBIENT_RGB = "96, 165, 250";

function parseRgbChannels(value: string): string {
  const normalized = (value || "")
    .trim()
    .replace(/\s*,\s*/g, " ")
    .split(/\s+/)
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry))
    .slice(0, 3)
    .map((entry) => Math.max(0, Math.min(255, Math.round(entry))));

  if (normalized.length < 3) {
    return DEFAULT_AMBIENT_RGB;
  }

  return `${normalized[0]}, ${normalized[1]}, ${normalized[2]}`;
}

export function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!(canvasElement instanceof HTMLCanvasElement)) return undefined;
    const canvas: HTMLCanvasElement = canvasElement;

    const context = canvas.getContext("2d");
    if (!context) return undefined;
    const ctx: CanvasRenderingContext2D = context;

    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let ambientParticleColor = DEFAULT_AMBIENT_RGB;
    let animationFrameId = 0;

    const reduceMotionQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const particles: Particle[] = [];

    function isReducedMotionEnabled() {
      return Boolean(reduceMotionQuery && reduceMotionQuery.matches);
    }

    function syncAmbientColor() {
      const rootStyles = getComputedStyle(document.documentElement);
      const ambientValue = (rootStyles.getPropertyValue("--ambient-particle-rgb") || "").trim();
      const accentFallback = (rootStyles.getPropertyValue("--accent-400") || "").trim();
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

    function createParticle(): Particle {
      return {
        x: Math.random() * viewportWidth,
        y: Math.random() * viewportHeight,
        size: Math.random() * 1.5 + 0.5,
        speedX: Math.random() * 0.4 - 0.2,
        speedY: Math.random() * 0.4 - 0.2,
        opacity: Math.random() * 0.3 + 0.2
      };
    }

    function initParticles() {
      particles.length = 0;
      for (let index = 0; index < PARTICLE_COUNT; index += 1) {
        particles.push(createParticle());
      }
    }

    function updateParticle(particle: Particle) {
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      if (particle.x > viewportWidth) particle.x = 0;
      else if (particle.x < 0) particle.x = viewportWidth;

      if (particle.y > viewportHeight) particle.y = 0;
      else if (particle.y < 0) particle.y = viewportHeight;
    }

    function drawParticle(particle: Particle) {
      ctx.fillStyle = `rgba(${ambientParticleColor}, ${particle.opacity})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }

    function connectParticles() {
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
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

    function renderFrame(shouldUpdate: boolean) {
      ctx.clearRect(0, 0, viewportWidth, viewportHeight);

      for (const particle of particles) {
        if (shouldUpdate) {
          updateParticle(particle);
        }
        drawParticle(particle);
      }

      connectParticles();
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

    window.addEventListener("resize", handleResize);
    window.addEventListener("archistra:theme-change", handleThemeChange);

    if (reduceMotionQuery) {
      if (typeof reduceMotionQuery.addEventListener === "function") {
        reduceMotionQuery.addEventListener("change", handleReducedMotionChange);
      } else if (typeof reduceMotionQuery.addListener === "function") {
        reduceMotionQuery.addListener(handleReducedMotionChange);
      }
    }

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener("resize", handleResize);
      window.removeEventListener("archistra:theme-change", handleThemeChange);

      if (reduceMotionQuery) {
        if (typeof reduceMotionQuery.removeEventListener === "function") {
          reduceMotionQuery.removeEventListener("change", handleReducedMotionChange);
        } else if (typeof reduceMotionQuery.removeListener === "function") {
          reduceMotionQuery.removeListener(handleReducedMotionChange);
        }
      }
    };
  }, []);

  return <canvas id="particles" ref={canvasRef} className="ambient-particles" aria-hidden="true" />;
}
