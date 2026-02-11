// Mountain with Water Flow Animation
class MountainWaterfall {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 350;
        this.time = 0;
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }
    
    init() {
        this.particles = [];
        
        // Create mountain shape
        this.mountain = this.generateMountain();
        
        // Water source point (partway up the mountain center)
        this.waterSource = {
            x: this.width * 0.5,
            y: this.height * 0.30 // Water starts 30% down from top
        };
        
        // Create water particles that fall straight down
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    createParticle() {
        // Particles start at the water source and fall straight down
        return {
            x: this.waterSource.x + (Math.random() - 0.5) * 80,
            y: this.waterSource.y + Math.random() * 50,
            vx: (Math.random() - 0.5) * 0.8,
            vy: Math.random() * 3 + 2,
            size: Math.random() * 3 + 1.5,
            opacity: Math.random() * 0.7 + 0.3,
            hue: 200 + Math.random() * 30,
            life: 0
        };
    }
    
    generateMountain() {
        const points = [];
        const segments = 100;
        const baseHeight = this.height * 0.85; // Mountain base at 85% down
        const peakHeight = this.height * 0.15; // Peak at 15% from top
        const peakX = this.width * 0.5; // Center peak
        
        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * this.width;
            const normalizedX = i / segments;
            
            // Create mountain profile - triangular with curves
            const distanceFromPeak = Math.abs(normalizedX - 0.5);
            
            let y;
            if (distanceFromPeak < 0.4) {
                // Main mountain body
                const mountainHeight = baseHeight - peakHeight;
                const slope = (distanceFromPeak / 0.4) * mountainHeight;
                y = peakHeight + slope;
                
                // Add natural curves and irregularities
                const curve1 = Math.sin(i * 0.2) * 30;
                const curve2 = Math.cos(i * 0.4) * 20;
                const detail = Math.sin(i * 0.8) * 10;
                
                y += curve1 + curve2 + detail;
            } else {
                // Gentle slopes to edges
                y = baseHeight;
            }
            
            points.push({ x, y });
        }
        
        return points;
    }
    
    getMountainHeightAt(x) {
        // Get mountain height at specific x coordinate
        const normalizedX = x / this.width;
        const index = Math.floor(normalizedX * 100);
        
        if (this.mountain[index]) {
            return this.mountain[index].y;
        }
        return this.height;
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Simple vertical fall with slight horizontal drift
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Gravity acceleration
            particle.vy += 0.15;
            
            // Slight horizontal turbulence
            particle.vx += (Math.random() - 0.5) * 0.3;
            
            // Air resistance
            particle.vx *= 0.98;
            
            // Fade as particles fall lower
            if (particle.y > this.height * 0.75) {
                particle.opacity -= 0.02;
            }
            
            // Reset particle when off screen
            if (particle.y > this.height || particle.opacity <= 0 || particle.x < 0 || particle.x > this.width) {
                const newParticle = this.createParticle();
                particle.x = newParticle.x;
                particle.y = newParticle.y;
                particle.vx = newParticle.vx;
                particle.vy = newParticle.vy;
                particle.opacity = newParticle.opacity;
                particle.life = 0;
            }
            
            particle.life += 0.01;
        });
    }
    
    drawBackground() {
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        
        const hue1 = 210 + Math.sin(this.time * 0.001) * 5;
        const hue2 = 200 + Math.cos(this.time * 0.0015) * 5;
        
        bgGradient.addColorStop(0, `hsla(${hue1}, 40%, 8%, 1)`);
        bgGradient.addColorStop(0.5, `hsla(${hue2}, 50%, 12%, 0.8)`);
        bgGradient.addColorStop(1, `hsla(${hue1}, 40%, 8%, 1)`);
        
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawMountain() {
        this.ctx.save();
        
        // Draw mountain silhouette
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height);
        
        this.mountain.forEach(point => {
            this.ctx.lineTo(point.x, point.y);
        });
        
        this.ctx.lineTo(this.width, this.height);
        this.ctx.closePath();
        
        // Mountain gradient - dark greys
        const mountainGradient = this.ctx.createLinearGradient(0, this.height * 0.15, 0, this.height);
        mountainGradient.addColorStop(0, 'rgba(60, 65, 75, 1)');
        mountainGradient.addColorStop(0.5, 'rgba(40, 45, 55, 1)');
        mountainGradient.addColorStop(1, 'rgba(25, 28, 35, 1)');
        
        this.ctx.fillStyle = mountainGradient;
        this.ctx.fill();
        
        // Mountain edge highlight
        this.ctx.beginPath();
        this.mountain.forEach((point, i) => {
            if (i === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        });
        
        this.ctx.strokeStyle = 'rgba(80, 95, 110, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawWaterSource() {
        // Draw subtle glow at water source
        this.ctx.save();
        
        const glowGradient = this.ctx.createRadialGradient(
            this.waterSource.x, this.waterSource.y, 0,
            this.waterSource.x, this.waterSource.y, 60
        );
        
        glowGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
        glowGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.1)');
        glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.waterSource.x, this.waterSource.y, 60, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            
            // Create glowing water particle
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 3
            );
            
            gradient.addColorStop(0, `hsla(${particle.hue}, 80%, 60%, 0.9)`);
            gradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, 50%, 0.5)`);
            gradient.addColorStop(1, `hsla(${particle.hue}, 60%, 40%, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add motion blur effect for falling water
            this.ctx.globalAlpha = particle.opacity * 0.4;
            this.ctx.fillStyle = `hsla(${particle.hue}, 70%, 55%, 0.3)`;
            this.ctx.beginPath();
            this.ctx.ellipse(
                particle.x, 
                particle.y - particle.vy * 1.5, 
                particle.size, 
                particle.size * 2.5, 
                0, 
                0, 
                Math.PI * 2
            );
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    animate() {
        this.time++;
        
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.drawBackground();
        this.drawMountain();
        this.drawWaterSource();
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
    
    // Initialize mountain waterfall animation
    new MountainWaterfall('waterfallCanvas');
    
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
