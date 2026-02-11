class SimpleParticleWaterfall {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext("2d");
        this.particles = [];
        this.time = 0;

        // Digital lane settings
        this.particleCount = 850;
        this.spawnBandWidth = 700;     // wide waterfall
        this.laneCount = 85;           // vertical lanes
        this.baseSpeed = 3.2;

        // Blue palette
        this.hues = [198, 204, 210, 216];

        this.resize();
        this.init();
        this.animate();

        window.addEventListener("resize", () => this.resize());
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + "px";
        this.canvas.style.height = window.innerHeight + "px";

        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.centerX = this.w / 2;

        this.laneSpacing = this.spawnBandWidth / this.laneCount;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle(true));
        }
    }

    createParticle(randomY = false) {
        const laneIndex = Math.floor(Math.random() * this.laneCount);

        const laneX =
            this.centerX -
            this.spawnBandWidth / 2 +
            laneIndex * this.laneSpacing;

        const y = randomY
            ? Math.random() * this.h
            : -20 - Math.random() * 200;

        return {
            laneX,
            x: laneX,
            y,
            vy: this.baseSpeed + Math.random() * 3,
            size: 2 + Math.random() * 2,
            opacity: 0.25 + Math.random() * 0.4,
            hue: this.hues[Math.floor(Math.random() * this.hues.length)],
        };
    }

    drawBackground() {
        const g = this.ctx.createLinearGradient(0, 0, 0, this.h);
        g.addColorStop(0, "rgba(6,10,18,1)");
        g.addColorStop(1, "rgba(8,12,20,1)");
        this.ctx.fillStyle = g;
        this.ctx.fillRect(0, 0, this.w, this.h);
    }

    update() {
        this.time++;

        for (const p of this.particles) {
            // Tiny jitter so lanes don't feel rigid
            p.x = p.laneX + Math.sin(this.time * 0.02 + p.y * 0.01) * 1.2;

            p.y += p.vy;

            if (p.y > this.h + 30) {
                const np = this.createParticle(false);
                Object.assign(p, np);
            }
        }
    }

    drawParticles() {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalCompositeOperation = "source-over";

        for (const p of this.particles) {
            ctx.globalAlpha = p.opacity;

            ctx.fillStyle = `hsla(${p.hue}, 85%, 65%, 1)`;

            // Square digital pixel
            ctx.fillRect(p.x, p.y, p.size, p.size);

            // Thin vertical digital trail
            ctx.globalAlpha = p.opacity * 0.35;
            ctx.fillRect(
                p.x + p.size / 2 - 1,
                p.y - p.vy * 2,
                2,
                p.size * 3
            );
        }

        ctx.restore();
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
