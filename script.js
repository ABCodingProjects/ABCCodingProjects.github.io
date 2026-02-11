// Enhanced Waterfall Animation
class WaterfallAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 200;
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
        
        // Create much wider waterfall stream
        this.particleCount = 400; // Increased for even denser, wider water
        
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: this.width * 0.5 + (Math.random() - 0.5) * 600, // Much wider: 600px spread (was 400px)
                y: Math.random() * this.height * 0.4,
                vx: (Math.random() - 0.5) * 1.5,
                vy: Math.random() * 4 + 3,
                size: Math.random() * 4 + 2,
                opacity: Math.random() * 0.7 + 0.3,
                hue: 200 + Math.random() * 30,
                life: Math.random(),
            });
        }
        
        // Create rock formations on left and right sides
        this.leftRocks = this.generateRockFormation('left');
        this.rightRocks = this.generateRockFormation('right');
    }
    
    generateRockFormation(side) {
        const rocks = [];
        const baseX = side === 'left' ? 0 : this.width;
        const direction = side === 'left' ? 1 : -1;
        
        // Create layered rock formations with more varied, interesting curves
        const layers = 3;
        for (let layer = 0; layer < layers; layer++) {
            const points = [];
            const segments = 50;
            const layerDepth = layer * 50 * direction;
            
            for (let i = 0; i <= segments; i++) {
                const y = (i / segments) * this.height;
                
                // Create varied, natural curves - more interesting erosion patterns
                const baseWidth = 320 + layer * 30; // Slightly narrower so waterfall is wider
                
                // Multiple overlapping wave patterns for varied curves
                const largeCurve = Math.sin(i * 0.12) * 80;
                const mediumCurve = Math.cos(i * 0.25 + layer) * 50;
                const smallCurve = Math.sin(i * 0.4 + layer * 2) * 35;
                const detailCurve = Math.cos(i * 0.6) * 20;
                
                // Add some variation based on height for more natural look
                const heightVariation = Math.sin(i * 0.08) * 40;
                
                // Combine all curves for complex, natural erosion pattern
                const erosionPattern = largeCurve + mediumCurve + smallCurve + detailCurve + heightVariation;
                
                const x = baseX + (baseWidth + erosionPattern) * direction + layerDepth;
                
                points.push({ x, y });
            }
            
            // Very visible dark stone colors - solid and opaque
            const stoneColors = [
                'rgba(50, 55, 65, 1)',      // Medium dark grey (frontmost)
                'rgba(35, 40, 48, 1)',      // Darker grey
                'rgba(25, 28, 35, 1)'       // Very dark grey/black
            ];
            
            rocks.push({
                points,
                color: stoneColors[layer],
                layer
            });
        }
        
        return rocks;
    }
    
    drawRockFormations() {
        // Draw left rock formations
        this.leftRocks.forEach((rock, index) => {
            this.ctx.save();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            
            rock.points.forEach(point => {
                this.ctx.lineTo(point.x, point.y);
            });
            
            this.ctx.lineTo(0, this.height);
            this.ctx.closePath();
            
            // Fill with solid stone color
            this.ctx.fillStyle = rock.color;
            this.ctx.fill();
            
            // Add soft edge highlights for smooth, eroded look
            this.ctx.beginPath();
            rock.points.forEach((point, i) => {
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            });
            
            // Soft, subtle highlights - water-polished stone
            if (index === 0) {
                this.ctx.strokeStyle = 'rgba(90, 110, 130, 0.6)';
                this.ctx.lineWidth = 3;
                this.ctx.lineJoin = 'round'; // Smooth rounded corners
                this.ctx.lineCap = 'round';
            } else {
                this.ctx.strokeStyle = 'rgba(70, 85, 100, 0.4)';
                this.ctx.lineWidth = 2;
                this.ctx.lineJoin = 'round';
                this.ctx.lineCap = 'round';
            }
            this.ctx.stroke();
            
            this.ctx.restore();
        });
        
        // Draw right rock formations
        this.rightRocks.forEach((rock, index) => {
            this.ctx.save();
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.width, 0);
            
            rock.points.forEach(point => {
                this.ctx.lineTo(point.x, point.y);
            });
            
            this.ctx.lineTo(this.width, this.height);
            this.ctx.closePath();
            
            // Fill with solid stone color
            this.ctx.fillStyle = rock.color;
            this.ctx.fill();
            
            // Add soft edge highlights
            this.ctx.beginPath();
            rock.points.forEach((point, i) => {
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            });
            
            // Soft, subtle highlights - water-polished stone
            if (index === 0) {
                this.ctx.strokeStyle = 'rgba(90, 110, 130, 0.6)';
                this.ctx.lineWidth = 3;
                this.ctx.lineJoin = 'round';
                this.ctx.lineCap = 'round';
            } else {
                this.ctx.strokeStyle = 'rgba(70, 85, 100, 0.4)';
                this.ctx.lineWidth = 2;
                this.ctx.lineJoin = 'round';
                this.ctx.lineCap = 'round';
            }
            this.ctx.stroke();
            
            this.ctx.restore();
        });
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Natural waterfall physics
            particle.y += particle.vy;
            particle.x += particle.vx;
            
            // Gravity acceleration
            particle.vy += 0.15;
            
            // Air resistance
            particle.vx *= 0.99;
            
            // Slight turbulence in the center
            particle.vx += (Math.random() - 0.5) * 0.2;
            
            // Check collision with left rocks
            if (particle.x < this.width * 0.3) {
                const leftEdge = this.getLeftRockEdge(particle.y);
                if (particle.x < leftEdge) {
                    particle.x = leftEdge;
                    particle.vx = Math.abs(particle.vx) * 0.6; // Bounce right
                    particle.vy *= 0.8; // Lose some downward momentum
                    
                    // Create splash effect
                    particle.opacity *= 0.7;
                }
            }
            
            // Check collision with right rocks
            if (particle.x > this.width * 0.7) {
                const rightEdge = this.getRightRockEdge(particle.y);
                if (particle.x > rightEdge) {
                    particle.x = rightEdge;
                    particle.vx = -Math.abs(particle.vx) * 0.6; // Bounce left
                    particle.vy *= 0.8; // Lose some downward momentum
                    
                    // Create splash effect
                    particle.opacity *= 0.7;
                }
            }
            
            // Update life
            particle.life += 0.01;
            
            // Fade as particles fall
            if (particle.y > this.height * 0.7) {
                particle.opacity -= 0.02;
            }
            
            // Reset particle at top when it reaches bottom or fades
            if (particle.y > this.height || particle.opacity <= 0) {
                particle.x = this.width * 0.5 + (Math.random() - 0.5) * 600; // Match wider spread
                particle.y = Math.random() * 50;
                particle.vx = (Math.random() - 0.5) * 1.5;
                particle.vy = Math.random() * 4 + 3;
                particle.opacity = Math.random() * 0.7 + 0.3;
                particle.life = 0;
            }
        });
    }
    
    getLeftRockEdge(y) {
        // Get the x position of the left rock edge at height y
        const normalizedY = y / this.height;
        const index = Math.floor(normalizedY * 29);
        
        if (this.leftRocks[0] && this.leftRocks[0].points[index]) {
            return this.leftRocks[0].points[index].x;
        }
        return 0;
    }
    
    getRightRockEdge(y) {
        // Get the x position of the right rock edge at height y
        const normalizedY = y / this.height;
        const index = Math.floor(normalizedY * 29);
        
        if (this.rightRocks[0] && this.rightRocks[0].points[index]) {
            return this.rightRocks[0].points[index].x;
        }
        return this.width;
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            
            // Create glowing particle effect
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
            
            // Add motion blur effect
            this.ctx.globalAlpha = particle.opacity * 0.5;
            this.ctx.fillStyle = `hsla(${particle.hue}, 70%, 55%, 0.3)`;
            this.ctx.beginPath();
            this.ctx.ellipse(
                particle.x, 
                particle.y - particle.vy, 
                particle.size, 
                particle.size * 2, 
                0, 
                0, 
                Math.PI * 2
            );
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    drawMist() {
        this.ctx.save();
        
        // Subtle mist at the base where water hits
        const mistY = this.height * 0.75;
        const mistGradient = this.ctx.createLinearGradient(0, mistY, 0, this.height);
        
        mistGradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
        mistGradient.addColorStop(0.3, `rgba(59, 130, 246, ${0.06 + Math.sin(this.time * 0.02) * 0.02})`);
        mistGradient.addColorStop(1, `rgba(6, 182, 212, ${0.10 + Math.cos(this.time * 0.015) * 0.03})`);
        
        this.ctx.fillStyle = mistGradient;
        this.ctx.fillRect(this.width * 0.3, mistY, this.width * 0.4, this.height - mistY);
        
        this.ctx.restore();
    }
    
    drawBackground() {
        // Animated gradient background
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        
        const hue1 = 210 + Math.sin(this.time * 0.001) * 5;
        const hue2 = 200 + Math.cos(this.time * 0.0015) * 5;
        
        bgGradient.addColorStop(0, `hsla(${hue1}, 40%, 8%, 1)`);
        bgGradient.addColorStop(0.5, `hsla(${hue2}, 50%, 12%, 0.8)`);
        bgGradient.addColorStop(1, `hsla(${hue1}, 40%, 8%, 1)`);
        
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    animate() {
        this.time++;
        
        this.drawBackground();
        // Draw water FIRST (behind rocks)
        this.updateParticles();
        this.drawParticles();
        this.drawMist();
        // Draw rocks LAST (in front of water)
        this.drawRockFormations();
        
        requestAnimationFrame(() => this.animate());
    }
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
    // Custom cursor tracking
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
    
    // Initialize waterfall animation
    new WaterfallAnimation('waterfallCanvas');
    
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
