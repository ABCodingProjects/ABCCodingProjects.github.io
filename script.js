// Simple Particle Waterfall Animation (constant flow) — denser + multi-blue + more solid stream
class SimpleParticleWaterfall {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.time = 0;

        // Tunables (density + solidity)
        this.particleCount = 1400;      // more particles
        this.spawnBandWidth = 190;      // narrower stream = more solid
        this.windStrength = 0.08;       // less sideways drift
        this.centerPull = 0.0019;       // stronger pull toward center
        this.flutter = 0.02;            // less random wobble
        this.coreBoost = 0.55;          // % of particles spawned as "core" (brighter/denser)
        this.maxVx = 1.6;               // clamp side velocity

        // Color palette (different blue shades)
        // Hue reference: ~190-220 = cyan/blue range
        this.hues = [192, 198, 204, 210, 216, 222];

        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    // Box–Muller transform for a nicer “solid stream” distribution
    randn() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.w = this.canvas.width;
        this.h = this.canvas.height;
        this.centerX = this.w * 0.5;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle(true));
        }
    }

    createParticle(randomY = false) {
        // Concentrate most particles near center using gaussian distribution
        const gaussian = this.randn(); // mean 0, std ~1
        const x = this.centerX + gaussian * (this.spawnBandWidth * 0.23);

        const y = randomY ? Math.random() * this.h : -30 - Math.random() * 260;

        const isCore = Math.random() < this.coreBoost; // core particles make the stream feel solid
        const baseHue = this.hues[Math.floor(Math.random() * this.hues.length)];
        const hue = baseHue + (Math.random() - 0.5) * (isCore ? 6 : 12);

        // Faster/heavier core particles, lighter mist particles
        const vy = (isCore ? 4.2 : 2.6) + Math.random() * (isCore ? 4.6 : 3.2);

        return {
            x,
            y,
            vx: (Math.random() - 0.5) * (isCore ? 0.22 : 0.4),
            vy,
            size: (isCore ? 1.3 : 0.9) + Math.random() * (isCore ? 2.8 : 2.0),
            opacity: (isCore ? 0.45 : 0.22) + Math.random() * (isCore ? 0.45 : 0.55),
            hue,
            sat: (isCore ? 90 : 80) + Math.random() * 10,
            lit: (isCore ? 62 : 58) + Math.random() * 10,
            isCore
        };
    }

    drawBackground() {
        const g = this.ctx.createLinearGradient(0, 0, 0, this.h);
        g.addColorStop(0, 'rgba(6, 10, 18, 1)');
        g.addColorStop(0.6, 'rgba(10, 14, 24, 1)');
        g.addColorStop(1, 'rgba(6, 10, 18, 1)');
        this.ctx.fillStyle = g;
        this.ctx.fillRect(0, 0, this.w, this.h);
    }

    drawStreamCore() {
        // A subtle vertical “core column” behind the particles to make the stream feel more continuous
        const ctx = this.ctx;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.22;

        const coreWidth = this.spawnBandWidth * 0.62;
        const x0 = this.centerX - coreWidth / 2;

        const g = ctx.createLinearGradient(0, 0, 0, this.h);
        g.addColorStop(0, 'rgba(80, 170, 255, 0.0)');
        g.addColorStop(0.15, 'rgba(80, 170, 255, 0.22)');
        g.addColorStop(0.55, 'rgba(60, 145, 255, 0.28)');
        g.addColorStop(1, 'rgba(40, 120, 255, 0.0)');

        // Soft edges with a radial falloff
        const edge = ctx.createLinearGradient(x0, 0, x0 + coreWidth, 0);
        edge.addColorStop(0, 'rgba(0,0,0,0)');
        edge.addColorStop(0.18, 'rgba(0,0,0,1)');
        edge.addColorStop(0.82, 'rgba(0,0,0,1)');
        edge.addColorStop(1, 'rgba(0,0,0,0)');

        // Draw the core column, then mask edges by drawing with destination-in
        ctx.fillStyle = g;
        ctx.fillRect(x0, 0, coreWidth, this.h);

        ctx.globalCompositeOperation = 'destination-in';
        ctx.fillStyle = edge;
        ctx.fillRect(x0 - 20, 0, coreWidth + 40, this.h);

        ctx.restore();
    }

    update() {
        this.time++;

        const wind = Math.sin(this.time * 0.003) * this.windStrength;

        for (const p of this.particles) {
            // Gentle drift + limited flutter
            p.vx += wind + (Math.random() - 0.5) * this.flutter;

            // Stronger pull back to center (more solid stream)
            const pull = (this.centerX - p.x) * this.centerPull;
            p.vx += pull;

            // Damping + clamp sideways velocity
            p.vx *= 0.975;
            if (p.vx > this.maxVx) p.vx = this.maxVx;
            if (p.vx < -this.maxVx) p.vx = -this.maxVx;

            // Move
            p.y += p.vy;
            p.x += p.vx;

            // Slight fade near bottom
            if (p.y > this.h * 0.86) p.opacity -= (p.isCore ? 0.004 : 0.007);

            // Respawn
            if (p.y > this.h + 50 || p.opacity <= 0) {
                const np = this.createParticle(false);
                p.x = np.x;
                p.y = np.y;
                p.vx = np.vx;
                p.vy = np.vy;
                p.size = np.size;
                p.opacity = np.opacity;
                p.hue = np.hue;
                p.sat = np.sat;
                p.lit = np.lit;
                p.isCore = np.isCore;
            }
        }
    }

    drawParticles() {
        const ctx = this.ctx;

        // Additive look helps make the stream feel brighter/denser
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));

            // Glow blob
            const r = p.size * (p.isCore ? 3.6 : 3.0);
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
            grad.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${p.lit + 8}%, 0.95)`);
            grad.addColorStop(0.45, `hsla(${p.hue}, ${p.sat - 8}%, ${p.lit}%, ${p.isCore ? 0.55 : 0.35})`);
            grad.addColorStop(1, `hsla(${p.hue}, ${p.sat - 15}%, ${p.lit - 10}%, 0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.fill();

            // Streak: a bit stronger for core particles
            ctx.globalAlpha *= (p.isCore ? 0.55 : 0.35);
            ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.lit + 6}%, ${p.isCore ? 0.55 : 0.35})`;
            ctx.beginPath();
            ctx.ellipse(
                p.x,
                p.y - p.vy * 1.15,
                p.size * (p.isCore ? 0.85 : 0.65),
                p.size * (p.isCore ? 3.6 : 3.0),
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();

            ctx.restore();
        }

        ctx.restore();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.w, this.h);
        this.drawBackground();
        this.drawStreamCore();
        this.update();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.w = this.canvas.width;
        this.h = this.canvas.height;
        this.centerX = this.w * 0.5;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle(true));
        }
    }

    createParticle(randomY = false) {
        const x = this.centerX + (Math.random() - 0.5) * this.spawnBandWidth;
        const y = randomY ? Math.random() * this.h : -20 - Math.random() * 200;

        return {
            x,
            y,
            vx: (Math.random() - 0.5) * 0.4,
            vy: 2.5 + Math.random() * 4.0,
            size: 1.0 + Math.random() * 2.2,
            opacity: 0.25 + Math.random() * 0.55,
            hue: 200 + Math.random() * 25
        };
    }

    drawBackground() {
        const g = this.ctx.createLinearGradient(0, 0, 0, this.h);
        g.addColorStop(0, 'rgba(6, 10, 18, 1)');
        g.addColorStop(0.6, 'rgba(10, 14, 24, 1)');
        g.addColorStop(1, 'rgba(6, 10, 18, 1)');
        this.ctx.fillStyle = g;
        this.ctx.fillRect(0, 0, this.w, this.h);
    }

    update() {
        this.time++;

        const wind = Math.sin(this.time * 0.003) * this.windStrength;

        for (const p of this.particles) {
            p.vx += wind + (Math.random() - 0.5) * 0.05;
            p.vx *= 0.985;

            p.y += p.vy;
            p.x += p.vx;

            // Soft pull back to center stream
            const pull = (this.centerX - p.x) * 0.0008;
            p.vx += pull;

            // Slight fade near bottom
            if (p.y > this.h * 0.85) p.opacity -= 0.006;

            // Respawn
            if (p.y > this.h + 40 || p.opacity <= 0) {
                const np = this.createParticle(false);
                p.x = np.x;
                p.y = np.y;
                p.vx = np.vx;
                p.vy = np.vy;
                p.size = np.size;
                p.opacity = np.opacity;
                p.hue = np.hue;
            }
        }
    }

    drawParticles() {
        for (const p of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));

            // Glow blob
            const r = p.size * 3.2;
            const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
            grad.addColorStop(0, `hsla(${p.hue}, 85%, 65%, 0.85)`);
            grad.addColorStop(0.5, `hsla(${p.hue}, 75%, 55%, 0.35)`);
            grad.addColorStop(1, `hsla(${p.hue}, 70%, 45%, 0)`);

            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            this.ctx.fill();

            // Faint streak
            this.ctx.globalAlpha *= 0.35;
            this.ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, 0.35)`;
            this.ctx.beginPath();
            this.ctx.ellipse(
                p.x,
                p.y - p.vy * 1.2,
                p.size * 0.7,
                p.size * 3.0,
                0,
                0,
                Math.PI * 2
            );
            this.ctx.fill();

            this.ctx.restore();
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.w, this.h);
        this.drawBackground();
        this.update();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}


// Custom cursor tracking
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid #3b82f6;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.2);
        pointer-events: none;
        z-index: 10000;
        transform: translate(-50%, -50%);
        transition: width 0.15s ease, height 0.15s ease, background 0.15s ease;
        mix-blend-mode: screen;
    `;
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    document.addEventListener('mousedown', () => {
        cursor.style.width = '16px';
        cursor.style.height = '16px';
        cursor.style.background = 'rgba(59, 130, 246, 0.5)';
    });
    
    document.addEventListener('mouseup', () => {
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        cursor.style.background = 'rgba(59, 130, 246, 0.2)';
    });
}

// Scroll Animations
class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('[data-scroll]');
        this.init();
    }
    
    init() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );
        
        this.elements.forEach(el => {
            this.observer.observe(el);
        });
    }
}

// Navigation Scroll Effect
class NavigationController {
    constructor() {
        this.nav = document.getElementById('mainNav');
        this.lastScroll = 0;
        this.init();
    }
    
    init() {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                this.nav.classList.add('scrolled');
            } else {
                this.nav.classList.remove('scrolled');
            }
            
            this.lastScroll = currentScroll;
        });
    }
}

// Number Counter Animation
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Smooth Scroll for Anchor Links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Mouse Parallax Effect for Hero Stats
function initParallax() {
    const stats = document.querySelector('.hero-stats');
    if (!stats) return;
    
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        const moveX = (mouseX - 0.5) * 20;
        const moveY = (mouseY - 0.5) * 20;
        
        stats.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize custom cursor
    initCustomCursor();
    
    // Initialize valley water flow animation
    new SimpleParticleWaterfall('waterfallCanvas');
    
    // Initialize scroll animations
    new ScrollAnimations();
    
    // Initialize navigation controller
    new NavigationController();
    
    // Initialize smooth scrolling
    initSmoothScroll();
    
    // Initialize parallax effect
    initParallax();
    
    // Animate counters when they come into view
    const counters = document.querySelectorAll('[data-count]');
    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    animateCounter(entry.target);
                    entry.target.dataset.animated = 'true';
                }
            });
        },
        { threshold: 0.5 }
    );
    
    counters.forEach(counter => counterObserver.observe(counter));
    
    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Stagger animation for cards
    document.querySelectorAll('.philosophy-card-modern, .ecosystem-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
});

// Preloader fade out
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
