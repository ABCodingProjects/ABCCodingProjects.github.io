// Valley with Flowing Water Animation
class ValleyWaterFlow {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 500;
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
        
        // Create valley shape - U-shaped with smooth curves
        this.valley = this.generateValley();
        
        // Create water particles that flow down the valley
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    generateValley() {
        const leftWall = [];
        const rightWall = [];
        const valleyFloor = [];
        const segments = 100;
        
        const valleyWidth = this.width * 0.3; // Valley opening width
        const valleyCenterX = this.width * 0.5;
        
        for (let i = 0; i <= segments; i++) {
            const y = (i / segments) * this.height;
            const progress = i / segments;
            
            // Valley gets narrower as it goes down, then opens up
            const narrowing = Math.sin(progress * Math.PI * 0.7) * 0.3 + 0.7;
            const currentWidth = (valleyWidth * narrowing) / 2;
            
            // Add curves and natural variations to valley walls
            const curve = Math.sin(progress * Math.PI * 2) * 40;
            const detail = Math.cos(progress * Math.PI * 4) * 15;
            
            leftWall.push({
                x: valleyCenterX - currentWidth + curve + detail,
                y: y
            });
            
            rightWall.push({
                x: valleyCenterX + currentWidth + curve - detail,
                y: y
            });
            
            // Valley floor follows the center with a curve
            valleyFloor.push({
                x: valleyCenterX + curve * 0.5,
                y: y
            });
        }
        
        return { leftWall, rightWall, valleyFloor };
    }
    
    getValleyWidth(y) {
        // Get valley width at specific y position
        const index = Math.floor((y / this.height) * 100);
        if (this.valley.leftWall[index] && this.valley.rightWall[index]) {
            return {
                left: this.valley.leftWall[index].x,
                right: this.valley.rightWall[index].x,
                center: this.valley.valleyFloor[index].x
            };
        }
        return { left: 0, right: this.width, center: this.width / 2 };
    }
    
    createParticle() {
        // Particles start at top of valley
        const startY = Math.random() * this.height * 0.3;
        const valleyInfo = this.getValleyWidth(startY);
        
        return {
            x: valleyInfo.center + (Math.random() - 0.5) * 80,
            y: startY,
            vx: 0,
            vy: Math.random() * 2 + 1,
            size: Math.random() * 3 + 1.5,
            opacity: Math.random() * 0.7 + 0.3,
            hue: 200 + Math.random() * 30,
            life: 0,
            followPath: true
        };
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Get valley information at current position
            const valleyInfo = this.getValleyWidth(particle.y);
            
            // Pull particle toward valley center
            const centerPull = (valleyInfo.center - particle.x) * 0.08;
            particle.vx += centerPull;
            
            // Keep particles within valley walls
            if (particle.x < valleyInfo.left + 10) {
                particle.x = valleyInfo.left + 10;
                particle.vx = Math.abs(particle.vx) * 0.5;
            }
            if (particle.x > valleyInfo.right - 10) {
                particle.x = valleyInfo.right - 10;
                particle.vx = -Math.abs(particle.vx) * 0.5;
            }
            
            // Apply physics
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Gravity acceleration
            particle.vy += 0.12;
            
            // Add turbulence
            particle.vx += (Math.random() - 0.5) * 0.4;
            
            // Friction/resistance
            particle.vx *= 0.97;
            
            // Limit speeds
            particle.vx = Math.max(-3, Math.min(3, particle.vx));
            particle.vy = Math.min(particle.vy, 8);
            
            // Fade at bottom
            if (particle.y > this.height * 0.8) {
                particle.opacity -= 0.02;
            }
            
            // Reset particle when off screen
            if (particle.y > this.height || particle.opacity <= 0) {
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
    
    drawValley() {
        this.ctx.save();
        
        // Draw left valley wall
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.valley.leftWall.forEach(point => {
            this.ctx.lineTo(point.x, point.y);
        });
        this.ctx.lineTo(0, this.height);
        this.ctx.closePath();
        
        const leftGradient = this.ctx.createLinearGradient(0, 0, this.width * 0.4, 0);
        leftGradient.addColorStop(0, 'rgba(25, 28, 35, 1)');
        leftGradient.addColorStop(0.7, 'rgba(45, 50, 60, 1)');
        leftGradient.addColorStop(1, 'rgba(55, 60, 70, 0.3)');
        
        this.ctx.fillStyle = leftGradient;
        this.ctx.fill();
        
        // Left wall edge highlight
        this.ctx.beginPath();
        this.valley.leftWall.forEach((point, i) => {
            if (i === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        });
        this.ctx.strokeStyle = 'rgba(80, 95, 110, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        
        // Draw right valley wall
        this.ctx.beginPath();
        this.ctx.moveTo(this.width, 0);
        this.valley.rightWall.forEach(point => {
            this.ctx.lineTo(point.x, point.y);
        });
        this.ctx.lineTo(this.width, this.height);
        this.ctx.closePath();
        
        const rightGradient = this.ctx.createLinearGradient(this.width, 0, this.width * 0.6, 0);
        rightGradient.addColorStop(0, 'rgba(25, 28, 35, 1)');
        rightGradient.addColorStop(0.7, 'rgba(45, 50, 60, 1)');
        rightGradient.addColorStop(1, 'rgba(55, 60, 70, 0.3)');
        
        this.ctx.fillStyle = rightGradient;
        this.ctx.fill();
        
        // Right wall edge highlight
        this.ctx.beginPath();
        this.valley.rightWall.forEach((point, i) => {
            if (i === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        });
        this.ctx.strokeStyle = 'rgba(80, 95, 110, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        
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
            
            // Add motion blur
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
    
    drawWaterGlow() {
        // Add subtle glow along the valley floor where water flows
        this.ctx.save();
        this.ctx.globalAlpha = 0.15;
        
        const glowGradient = this.ctx.createLinearGradient(
            this.width * 0.35, 0,
            this.width * 0.65, 0
        );
        glowGradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
        glowGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.3)');
        glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.fillRect(this.width * 0.35, 0, this.width * 0.3, this.height);
        
        this.ctx.restore();
    }
    
    animate() {
        this.time++;
        
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.drawBackground();
        this.drawWaterGlow();
        this.drawValley();
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
    new ValleyWaterFlow('waterfallCanvas');
    
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
