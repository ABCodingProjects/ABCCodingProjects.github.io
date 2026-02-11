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
        
        // Create prominent fog clouds that flow through peaks
        this.fogClouds = [];
        for (let i = 0; i < 20; i++) {
            this.fogClouds.push({
                x: Math.random() * this.width * 1.5 - this.width * 0.25,
                y: this.height * 0.35 + Math.random() * this.height * 0.25,
                vx: (Math.random() - 0.5) * 0.6 + 0.3, // Mostly moving right
                vy: (Math.random() - 0.5) * 0.15, // Slight vertical drift
                size: Math.random() * 250 + 150,
                opacity: Math.random() * 0.35 + 0.25, // Much more visible
                life: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    generateCliff() {
        const points = [];
        const segments = 120;
        const baseHeight = this.height * 0.65;
        
        // Define 4 distinct peaks with precise positions
        const peaks = [
            { position: 0.2, height: 180, width: 0.15 },   // Left peak - medium
            { position: 0.45, height: 320, width: 0.12 },  // CENTER SUMMIT - tallest
            { position: 0.65, height: 200, width: 0.13 },  // Right-center peak - medium-tall
            { position: 0.85, height: 150, width: 0.14 }   // Far right peak - shorter
        ];
        
        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * this.width;
            const normalizedX = i / segments;
            
            let y = baseHeight;
            
            // Calculate contribution from each peak (triangular shape)
            peaks.forEach(peak => {
                const distanceFromPeak = Math.abs(normalizedX - peak.position);
                
                if (distanceFromPeak < peak.width) {
                    // Create sharp triangular peak
                    const peakContribution = (1 - distanceFromPeak / peak.width) * peak.height;
                    y -= peakContribution;
                }
            });
            
            // Add slight jaggedness to edges only
            const edgeNoise = Math.sin(i * 2) * 8;
            y += edgeNoise;
            
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
            // Flow horizontally with varying speeds
            cloud.x += cloud.vx;
            
            // Gentle vertical oscillation as fog rises and falls
            cloud.y += cloud.vy + Math.sin(cloud.life) * 0.2;
            cloud.life += cloud.speed;
            
            // Wrap around screen for continuous flow
            if (cloud.x > this.width + cloud.size) {
                cloud.x = -cloud.size;
                cloud.y = this.height * 0.35 + Math.random() * this.height * 0.25;
            } else if (cloud.x < -cloud.size) {
                cloud.x = this.width + cloud.size;
                cloud.y = this.height * 0.35 + Math.random() * this.height * 0.25;
            }
            
            // Keep fog in mountain range vertically
            if (cloud.y < this.height * 0.3) cloud.vy = Math.abs(cloud.vy);
            if (cloud.y > this.height * 0.6) cloud.vy = -Math.abs(cloud.vy);
            
            // Dynamic opacity pulsing for depth
            cloud.opacity = 0.3 + Math.sin(cloud.life * 0.5) * 0.15;
        });
    }
    
    drawFog() {
        this.ctx.save();
        
        // Add blur filter for softer, more atmospheric fog
        this.ctx.filter = 'blur(8px)';
        
        this.fogClouds.forEach(cloud => {
            this.ctx.globalAlpha = cloud.opacity;
            
            // Create prominent, wispy fog clouds
            const fogGradient = this.ctx.createRadialGradient(
                cloud.x, 
                cloud.y, 
                0,
                cloud.x, 
                cloud.y, 
                cloud.size
            );
            
            // Much more visible white-blue fog
            fogGradient.addColorStop(0, 'rgba(240, 250, 255, 0.9)');
            fogGradient.addColorStop(0.3, 'rgba(220, 235, 245, 0.7)');
            fogGradient.addColorStop(0.6, 'rgba(180, 210, 230, 0.4)');
            fogGradient.addColorStop(1, 'rgba(140, 180, 210, 0)');
            
            this.ctx.fillStyle = fogGradient;
            
            // Draw main cloud body with irregular, flowing shape
            this.ctx.beginPath();
            const points = 16;
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const variation = Math.sin(angle * 5 + cloud.life) * 0.3 + 
                                Math.cos(angle * 3 + cloud.life * 1.5) * 0.2;
                const radius = cloud.size * (0.6 + variation);
                const x = cloud.x + Math.cos(angle) * radius;
                const y = cloud.y + Math.sin(angle) * radius * 0.7; // Flatten slightly
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            this.ctx.fill();
            
            // Add wispy tendrils that flow through peaks
            this.ctx.globalAlpha = cloud.opacity * 0.6;
            const tendrils = 5;
            for (let j = 0; j < tendrils; j++) {
                const tendrilAngle = (j / tendrils) * Math.PI * 2;
                const tendrilX = cloud.x + Math.cos(tendrilAngle + cloud.life) * cloud.size * 0.7;
                const tendrilY = cloud.y + Math.sin(tendrilAngle + cloud.life * 0.8) * cloud.size * 0.3;
                
                const tendrilGradient = this.ctx.createRadialGradient(
                    tendrilX, tendrilY, 0,
                    tendrilX, tendrilY, cloud.size * 0.5
                );
                
                tendrilGradient.addColorStop(0, 'rgba(230, 240, 250, 0.8)');
                tendrilGradient.addColorStop(0.5, 'rgba(200, 220, 235, 0.4)');
                tendrilGradient.addColorStop(1, 'rgba(170, 200, 220, 0)');
                
                this.ctx.fillStyle = tendrilGradient;
                
                // Draw elongated, wispy tendril
                this.ctx.beginPath();
                for (let k = 0; k < 8; k++) {
                    const a = (k / 8) * Math.PI * 2;
                    const r = cloud.size * 0.5 * (0.8 + Math.sin(a * 3 + cloud.life) * 0.2);
                    const px = tendrilX + Math.cos(a) * r;
                    const py = tendrilY + Math.sin(a) * r * 0.4;
                    
                    if (k === 0) {
                        this.ctx.moveTo(px, py);
                    } else {
                        this.ctx.lineTo(px, py);
                    }
                }
                this.ctx.closePath();
                this.ctx.fill();
            }
            
            // Add subtle streaks for flowing effect
            this.ctx.globalAlpha = cloud.opacity * 0.3;
            this.ctx.strokeStyle = 'rgba(220, 235, 245, 0.6)';
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            
            for (let s = 0; s < 3; s++) {
                this.ctx.beginPath();
                const startX = cloud.x - cloud.size * 0.3;
                const startY = cloud.y + (s - 1) * 20;
                const endX = cloud.x + cloud.size * 0.4;
                const endY = startY + Math.sin(cloud.life + s) * 15;
                
                this.ctx.moveTo(startX, startY);
                this.ctx.quadraticCurveTo(
                    (startX + endX) / 2, 
                    (startY + endY) / 2 + Math.sin(cloud.life * 2 + s) * 10,
                    endX, 
                    endY
                );
                this.ctx.stroke();
            }
        });
        
        this.ctx.filter = 'none';
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