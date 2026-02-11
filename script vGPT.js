// Simple Particle Waterfall Animation (constant flow)
class SimpleParticleWaterfall {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.time = 0;

        // Tunables
        this.particleCount = 450;
        this.spawnBandWidth = 260; // width of the waterfall stream
        this.windStrength = 0.15;  // subtle sideways drift

        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
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
