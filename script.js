/* ============================================
   BIRTHDAY WEBSITE JAVASCRIPT - MOBILE OPTIMIZED
   Pure vanilla JS - no frameworks needed
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initConfetti();
    initScrollAnimations();
    initTypewriter();
    initMusicPlayer();
    initMobileOptimizations();
});

/* ============================================
   MOBILE-SPECIFIC OPTIMIZATIONS
   ============================================ */
function initMobileOptimizations() {
    // Detect if user is on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Reduce confetti on mobile for better performance
        adjustConfettiForMobile();
        
        // Prevent pull-to-refresh interference
        preventPullToRefresh();
        
        // Fix viewport height on mobile browsers
        fixMobileViewportHeight();
        
        // Optimize video for mobile
        optimizeVideoForMobile();
    }
}

function adjustConfettiForMobile() {
    // This will be called from initConfetti if needed
    window.isMobileDevice = true;
}

function preventPullToRefresh() {
    let lastTouchY = 0;
    let preventPullToRefresh = false;
    
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        lastTouchY = e.touches[0].clientY;
        preventPullToRefresh = window.pageYOffset === 0;
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const touchYDelta = touchY - lastTouchY;
        lastTouchY = touchY;
        
        if (preventPullToRefresh && touchYDelta > 0) {
            e.preventDefault();
        }
    }, { passive: false });
}

function fixMobileViewportHeight() {
    // Fix for mobile browsers with dynamic toolbars
    function setVH() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setVH();
    window.addEventListener('resize', debounce(setVH, 100));
    window.addEventListener('orientationchange', setVH);
}

function optimizeVideoForMobile() {
    const video = document.getElementById('bgVideo');
    if (video && window.innerWidth < 768) {
        // Reduce quality on mobile to save bandwidth
        video.playbackRate = 1;
        // Some mobile browsers need explicit play
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Auto-play was prevented, video will play when user interacts
                console.log('Video autoplay prevented by browser');
            });
        }
    }
}

/* ============================================
   CONFETTI ANIMATION - MOBILE OPTIMIZED
   ============================================ */
function initConfetti() {
    const canvas = document.getElementById('confetti');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', debounce(resizeCanvas, 250));
    
    // Confetti particles array
    const particles = [];
    const colors = ['#ff9a9e', '#fecfef', '#a18cd1', '#fbc2eb', '#ffd1ff', '#fff'];
    
    // Reduce particle count on mobile for better performance
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 75 : 150;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * (isMobile ? 8 : 10) + (isMobile ? 3 : 5),
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 2 - 1,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5,
            shape: Math.random() > 0.5 ? 'rect' : 'circle'
        });
    }
    
    // Animation loop
    let animationFrame;
    let startTime = Date.now();
    const duration = isMobile ? 4000 : 5000; // Shorter on mobile
    
    function animate() {
        const elapsed = Date.now() - startTime;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(p => {
            // Update position
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;
            
            // Draw particle
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            
            if (p.shape === 'rect') {
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
            
            // Reset particle if off screen
            if (p.y > canvas.height) {
                p.y = -p.size;
                p.x = Math.random() * canvas.width;
            }
        });
        
        // Fade out confetti after duration
        if (elapsed < duration) {
            animationFrame = requestAnimationFrame(animate);
        } else {
            // Gradually fade out
            canvas.style.transition = 'opacity 1s ease';
            canvas.style.opacity = '0';
            setTimeout(() => {
                cancelAnimationFrame(animationFrame);
                canvas.style.display = 'none';
            }, 1000);
        }
    }
    
    animate();
}

/* ============================================
   SCROLL ANIMATIONS (Intersection Observer)
   ============================================ */
function initScrollAnimations() {
    // Observe reason cards for pop-in animation
    const cards = document.querySelectorAll('.reason-card');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Staggered animation delay based on card position
                const delay = parseInt(entry.target.dataset.reason) * 50;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    cards.forEach(card => observer.observe(card));
}

/* ============================================
   TYPEWRITER EFFECT - MOBILE OPTIMIZED
   ============================================ */
function initTypewriter() {
    const element = document.querySelector('.typewriter');
    const text = element.dataset.text;
    
    // Clear existing content
    element.textContent = '';
    
    // Create cursor
    const cursor = document.createElement('span');
    cursor.classList.add('cursor');
    
    let charIndex = 0;
    const isMobile = window.innerWidth < 768;
    const typingSpeed = isMobile ? 20 : 30; // Faster on mobile
    
    // Intersection Observer to start typing when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startTyping();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    observer.observe(element);
    
    function startTyping() {
        element.appendChild(cursor);
        typeNextChar();
    }
    
    function typeNextChar() {
        if (charIndex < text.length) {
            // Insert character before cursor
            const char = document.createTextNode(text[charIndex]);
            element.insertBefore(char, cursor);
            charIndex++;
            
            // Variable speed for natural feel
            const delay = text[charIndex - 1] === '\n' ? typingSpeed * 5 : 
                         text[charIndex - 1] === '.' ? typingSpeed * 3 : 
                         typingSpeed;
            
            setTimeout(typeNextChar, delay);
        } else {
            // Remove cursor after typing complete (optional)
            setTimeout(() => {
                cursor.style.animation = 'none';
                cursor.style.opacity = '0';
            }, 2000);
        }
    }
}

/* ============================================
   MUSIC PLAYER - MOBILE OPTIMIZED
   ============================================ */
function initMusicPlayer() {
    const btn = document.querySelector('.music-btn');
    const audio = document.getElementById('bgMusic');
    let isPlaying = false;
    
    // Handle audio context for mobile browsers
    const handleFirstInteraction = () => {
        if (audio.paused) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        isPlaying = true;
                        btn.textContent = '⏸️';
                        btn.classList.add('playing');
                    })
                    .catch(() => {
                        console.log('Audio playback prevented by browser');
                    });
            }
        }
    };
    
    btn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            btn.textContent = '🎵';
            btn.classList.remove('playing');
            isPlaying = false;
        } else {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        btn.textContent = '⏸️';
                        btn.classList.add('playing');
                        isPlaying = true;
                    })
                    .catch((error) => {
                        console.log('Audio play failed:', error);
                        // Try again with user interaction
                        document.addEventListener('touchstart', handleFirstInteraction, { once: true });
                    });
            }
        }
    });
    
    // Handle audio end
    audio.addEventListener('ended', () => {
        isPlaying = false;
        btn.textContent = '🎵';
        btn.classList.remove('playing');
    });
}

/* ============================================
   UTILITY: Debounce function
   ============================================ */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/* ============================================
   iOS-SPECIFIC FIXES
   ============================================ */
(function() {
    // Detect iOS
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    
    if (isIOS) {
        // Fix video playback on iOS
        const video = document.getElementById('bgVideo');
        if (video) {
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.setAttribute('muted', '');
            
            // Ensure video plays on iOS
            video.load();
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay was prevented
                    console.log('Video autoplay prevented on iOS');
                });
            }
        }
        
        // Fix 100vh issue on iOS
        const setIOSHeight = () => {
            document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        };
        setIOSHeight();
        window.addEventListener('resize', debounce(setIOSHeight, 100));
    }
})();