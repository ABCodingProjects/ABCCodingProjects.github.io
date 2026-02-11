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
        
        // Create enhanced waterfall particles
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: this.width * 0.5 + (Math.random() - 0.5) * 150,
                y: this.height * 0.15 + Math.random() * 150,
                vx: (Math.random() - 0.5) * 0.8,
                vy: Math.random() * 3 + 2,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.6 + 0.4,
                hue: 200 + Math.random() * 40,
                life: Math.random(),
                maxLife: 1,
            });
        }
        
        // Create mountain/cliff structure
        this.cliffPoints = this.generateCliff();
        
        // Create fog clouds at mountain peak level
        this.fogClouds = [];
        for (let i = 0; i < 12; i++) {
            this.fogClouds.push({
                x: Math.random() * this.width,
                y: this.height * 0.35 + Math.random() * this.height * 0.15, // Position at peak level
                vx: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 180 + 120,
                opacity: Math.random() * 0.2 + 0.15,
                life: Math.random() * Math.PI * 2
            });
        }
    }
    
    generateCliff() {
        const points = [];
        const segments = 25; // Much fewer segments for larger, more distinct peaks
        const baseHeight = this.height * 0.55;
        
        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * this.width;
            
            // Create major peaks (3-4 large mountains across screen)
            const majorPeak = Math.abs(Math.sin(i * 0.4)) * 200;
            
            // Add secondary ridges below summits
            const secondaryRidge = Math.abs(Math.cos(i * 1.2)) * 80;
            
            // Sharp angular variations for jagged edges
            const sharpNoise = (Math.random() - 0.5) * 60;
            
            const y = baseHeight - majorPeak - secondaryRidge + sharpNoise;
            
            points.push({ x, y });
        }
        
        return points;
    }
    
    drawCliff() {
        this.ctx.save();
        
        // Draw dark cliff silhouette
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height);
        
        this.cliffPoints.forEach(point => {
            this.ctx.lineTo(point.x, point.y);
        });
        
        this.ctx.lineTo(this.width, this.height);
        this.ctx.closePath();
        
        const cliffGradient = this.ctx.createLinearGradient(0, this.height * 0.3, 0, this.height);
        cliffGradient.addColorStop(0, 'rgba(10, 13, 18, 0.9)');
        cliffGradient.addColorStop(0.5, 'rgba(19, 23, 31, 0.95)');
        cliffGradient.addColorStop(1, 'rgba(10, 13, 18, 1)');
        
        this.ctx.fillStyle = cliffGradient;
        this.ctx.fill();
        
        // Subtle cliff edge highlight
        this.ctx.beginPath();
        this.cliffPoints.forEach((point, i) => {
            if (i === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        });
        
        this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        this.ctx.lineWidth = 3;
        this.ctx.lineJoin = 'miter'; // Sharp corners instead of rounded
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Update position with slight wave motion
            particle.x += particle.vx + Math.sin(this.time * 0.01 + particle.life * 10) * 0.3;
            particle.y += particle.vy;
            
            // Gravity effect
            particle.vy += 0.08;
            
            // Update life
            particle.life += 0.008;
            
            // Fade based on position and life
            if (particle.y > this.height * 0.7) {
                particle.opacity -= 0.025;
            }
            
            // Reset particle if off screen or faded
            if (particle.y > this.height || particle.opacity <= 0) {
                particle.x = this.width * 0.5 + (Math.random() - 0.5) * 150;
                particle.y = this.height * 0.15 + Math.random() * 100;
                particle.vx = (Math.random() - 0.5) * 0.8;
                particle.vy = Math.random() * 3 + 2;
                particle.opacity = Math.random() * 0.6 + 0.4;
                particle.life = 0;
                particle.hue = 200 + Math.random() * 40;
            }
            
            // Air resistance
            particle.vx *= 0.98;
        });
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
        
        // Animated mist at the bottom
        const mistY = this.height * 0.65;
        const mistGradient = this.ctx.createLinearGradient(0, mistY, 0, this.height);
        
        mistGradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
        mistGradient.addColorStop(0.4, `rgba(59, 130, 246, ${0.08 + Math.sin(this.time * 0.02) * 0.02})`);
        mistGradient.addColorStop(1, `rgba(6, 182, 212, ${0.12 + Math.cos(this.time * 0.015) * 0.03})`);
        
        this.ctx.fillStyle = mistGradient;
        this.ctx.fillRect(0, mistY, this.width, this.height - mistY);
        
        this.ctx.restore();
    }
    
    updateFog() {
        this.fogClouds.forEach(cloud => {
            // Move fog horizontally
            cloud.x += cloud.vx;
            
            // Gentle vertical oscillation
            cloud.life += 0.01;
            
            // Wrap around screen
            if (cloud.x > this.width + cloud.size) {
                cloud.x = -cloud.size;
            } else if (cloud.x < -cloud.size) {
                cloud.x = this.width + cloud.size;
            }
            
            // Pulsing opacity
            cloud.opacity = 0.12 + Math.sin(cloud.life) * 0.08;
        });
    }
    
    drawFog() {
        this.ctx.save();
        
        this.fogClouds.forEach(cloud => {
            this.ctx.globalAlpha = cloud.opacity;
            
            // Create soft, wispy fog clouds
            const fogGradient = this.ctx.createRadialGradient(
                cloud.x, 
                cloud.y + Math.sin(cloud.life) * 15, 
                0,
                cloud.x, 
                cloud.y + Math.sin(cloud.life) * 15, 
                cloud.size
            );
            
            // More visible fog with blue-white tones
            fogGradient.addColorStop(0, 'rgba(200, 220, 240, 0.7)');
            fogGradient.addColorStop(0.4, 'rgba(160, 190, 220, 0.4)');
            fogGradient.addColorStop(0.7, 'rgba(120, 150, 180, 0.2)');
            fogGradient.addColorStop(1, 'rgba(80, 110, 140, 0)');
            
            this.ctx.fillStyle = fogGradient;
            this.ctx.beginPath();
            
            // Draw organic, wispy cloud shape
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                const radius = cloud.size * (0.7 + Math.sin(angle * 4 + cloud.life * 2) * 0.3);
                const x = cloud.x + Math.cos(angle) * radius;
                const y = (cloud.y + Math.sin(cloud.life) * 15) + Math.sin(angle) * radius * 0.6;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.closePath();
            this.ctx.fill();
            
            // Add extra wispy tendrils
            this.ctx.globalAlpha = cloud.opacity * 0.5;
            for (let j = 0; j < 3; j++) {
                const tendrilGradient = this.ctx.createRadialGradient(
                    cloud.x + Math.cos(j * 2) * cloud.size * 0.5,
                    cloud.y + Math.sin(cloud.life + j) * 10,
                    0,
                    cloud.x + Math.cos(j * 2) * cloud.size * 0.5,
                    cloud.y + Math.sin(cloud.life + j) * 10,
                    cloud.size * 0.4
                );
                
                tendrilGradient.addColorStop(0, 'rgba(180, 200, 220, 0.5)');
                tendrilGradient.addColorStop(1, 'rgba(120, 150, 180, 0)');
                
                this.ctx.fillStyle = tendrilGradient;
                this.ctx.beginPath();
                this.ctx.arc(
                    cloud.x + Math.cos(j * 2) * cloud.size * 0.5,
                    cloud.y + Math.sin(cloud.life + j) * 10,
                    cloud.size * 0.4,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            }
        });
        
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
        this.drawCliff();
        this.updateParticles();
        this.drawParticles();
        this.updateFog();
        this.drawFog();
        this.drawMist();
        
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
