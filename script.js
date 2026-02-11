// Digital Waterfall (glowy particles + subtle motion blur)
// Drop-in replacement: keeps the name SimpleParticleWaterfall so your existing init keeps working.
class SimpleParticleWaterfall {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.time = 0;

    // TUNABLES
    this.particleCount = 420;          // increase for denser water
    this.spawnWidth = 420;             // width of the stream
    this.spawnY = 0.15;                // spawn start as % of height
    this.initialSpreadY = 150;         // how "tall" the spawn region is
    this.gravity = 0.08;               // acceleration
    this.fadeStart = 0.70;             // start fading at % height

    this.resize();
    this.init();
    this.animate();

    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    // HiDPI-safe
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + "px";
    this.canvas.style.height = window.innerHeight + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.centerX = this.width * 0.5;
  }

init() {
  this.particles = [];
  for (let i = 0; i < this.particleCount; i++) {
    const p = this.createParticle(false);
    // distribute across the full height so it starts as a steady stream
    p.y = Math.random() * this.height;
    // vary speed a bit so it doesn't feel synchronized
    p.vy = Math.random() * 3 + 2;
    this.particles.push(p);
  }
}

  createParticle(randomY = false) {
    return {
      x: this.centerX + (Math.random() - 0.5) * this.spawnWidth,
      y: this.height * this.spawnY + (randomY ? Math.random() * this.initialSpreadY : -Math.random() * 200),
      vx: (Math.random() - 0.5) * 0.8,
      vy: Math.random() * 3 + 2,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.35,
      hue: 195 + Math.random() * 35,   // blue/cyan range
      life: Math.random()              // used for wave phase variety
    };
  }

  updateParticles() {
    this.time++;

    for (const p of this.particles) {
      // Subtle “digital” wave motion (you can reduce this if it feels too swimmy)
      const wave = Math.sin(this.time * 0.01 + p.life * 10) * 0.30;

      p.x += p.vx + wave;
      p.y += p.vy;

      // Gravity
      p.vy += this.gravity;

      // Slight air resistance
      p.vx *= 0.98;

      // Fade near bottom
      if (p.y > this.height * this.fadeStart) {
        p.opacity -= 0.025;
      }

      // Reset if out of view
      if (p.y > this.height + 40 || p.opacity <= 0) {
        const np = this.createParticle(false);
        p.x = np.x;
        p.y = np.y;
        p.vx = np.vx;
        p.vy = np.vy;
        p.size = np.size;
        p.opacity = np.opacity;
        p.hue = np.hue;
        p.life = 0;
      }
    }
  }

  drawParticles() {
    const ctx = this.ctx;

    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.opacity;

      // Glow blob
      const r = p.size * 3;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, `hsla(${p.hue}, 80%, 60%, 0.90)`);
      g.addColorStop(0.5, `hsla(${p.hue}, 70%, 50%, 0.45)`);
      g.addColorStop(1, `hsla(${p.hue}, 60%, 40%, 0)`);

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Motion blur streak (vertical)
      ctx.globalAlpha = p.opacity * 0.40;
      ctx.fillStyle = `hsla(${p.hue}, 70%, 55%, 0.35)`;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - p.vy, p.size, p.size * 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  drawBackground() {
    // Keep it subtle so water stays readable without blasting brightness
    const g = this.ctx.createLinearGradient(0, 0, 0, this.height);
    g.addColorStop(0, "rgba(6,10,18,1)");
    g.addColorStop(1, "rgba(8,12,20,1)");
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackground();
    this.updateParticles();
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
