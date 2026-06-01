/* ==========================================================================
   PARTICLE CANVAS ENGINE
   ========================================================================== */
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let confetti = [];
const heartPath = new Path2D('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');

// Resize Canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Standard Drift Particle Class (Hearts & Gold Sparks)
class Particle {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height; // Spread initially
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.size = Math.random() * 8 + 3;
        this.speedY = Math.random() * 0.8 + 0.3;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.opacity = Math.random() * 0.5 + 0.15;
        this.isHeart = Math.random() > 0.6; // 40% hearts, 60% sparks
        this.hue = Math.random() > 0.5 ? 335 : 275; // Rose vs Purple
        this.rotation = Math.random() * Math.PI;
        this.rotSpeed = Math.random() * 0.01 - 0.005;
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotSpeed;

        // Fading out near top
        if (this.y < 50) {
            this.opacity -= 0.01;
        }

        if (this.y < -20 || this.opacity <= 0) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        
        if (this.isHeart) {
            ctx.scale(this.size / 10, this.size / 10);
            ctx.rotate(this.rotation);
            ctx.fillStyle = `hsl(${this.hue}, 100%, 65%)`;
            // Center the heart path
            ctx.translate(-12, -12);
            ctx.fill(heartPath);
        } else {
            // Gold sparkles
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(43, 100%, 70%)`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
            ctx.fill();
        }
        ctx.restore();
    }
}

// Confetti Explosion Particle Class
class Confetti {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 10 + 6;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - Math.random() * 4; // Biased upwards
        this.opacity = 1;
        this.rotation = Math.random() * Math.PI;
        this.rotSpeed = Math.random() * 0.2 - 0.1;
        this.color = `hsl(${Math.random() * 360}, 95%, 60%)`;
        this.isHeart = Math.random() > 0.4;
        this.gravity = 0.18;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.rotation += this.rotSpeed;
        this.opacity -= 0.015;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.isHeart) {
            ctx.scale(this.size / 12, this.size / 12);
            ctx.translate(-12, -12);
            ctx.fillStyle = this.color;
            ctx.fill(heartPath);
        } else {
            // Shiny rectangular ribbon
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
        }
        ctx.restore();
    }
}

// Populate background particles (fewer on mobile for 60fps fluidity)
const particleCount = window.innerWidth < 768 ? 30 : 70;
for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

// Burst confetti helper
function triggerConfettiBurst(x, y, count = 80) {
    for (let i = 0; i < count; i++) {
        confetti.push(new Confetti(x, y));
    }
}

// Particle Loop
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background dust & hearts
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Active confetti list
    for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.update();
        c.draw();
        if (c.opacity <= 0) {
            confetti.splice(i, 1);
        }
    }

    requestAnimationFrame(animateParticles);
}
animateParticles();

/* ==========================================================================
   NAVIGATION SYSTEM
   ========================================================================== */
let isUnlocked = false;
let audioStarted = false;

function navigateToView(targetId) {
    // Check if trying to navigate to locked surprise
    if (targetId === 'surprise' && !isUnlocked) {
        // Render lock shake or navigate to locked card
        document.getElementById('surprise-locked').classList.remove('hidden');
        document.getElementById('surprise-unlocked').classList.add('hidden');
    }

    // Toggle views
    const views = document.querySelectorAll('.app-view');
    views.forEach(view => {
        if (view.id === targetId) {
            view.classList.remove('hidden');
            setTimeout(() => view.classList.add('active'), 50);
        } else {
            view.classList.remove('active');
            view.classList.add('hidden');
        }
    });

    // Update active nav link
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        if (link.getAttribute('href') === `#${targetId}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Control background native HTML5 audio
    const nativeAudio = document.getElementById('bg-audio');
    if (nativeAudio) {
        if (targetId === 'gallery') {
            nativeAudio.volume = 0.8;
            // Seek to exactly 3 minutes and 5 seconds (185 seconds) on first play
            if (!audioStarted) {
                nativeAudio.currentTime = 185;
                audioStarted = true;
            }
            nativeAudio.play().catch(err => console.log("Audio autoplay block bypass: ", err));
        } else {
            nativeAudio.pause();
        }
    }

    // Dynamic staggered card reveal for Memory Gallery
    const cards = document.querySelectorAll('.gallery-card-item');
    if (window.galleryTimers) {
        window.galleryTimers.forEach(t => clearTimeout(t));
    }
    window.galleryTimers = [];

    if (targetId === 'gallery') {
        // Initially hide all cards
        cards.forEach(card => card.classList.remove('reveal'));
        
        // Staggered reveal: Card 1 in 0.5s, then 1s delay for each subsequent card (1.5s, 2.5s, etc.)
        cards.forEach((card, index) => {
            const delay = 500 + index * 1000;
            const timer = setTimeout(() => {
                card.classList.add('reveal');
                
                // Micro stardust explosion at card center for a premium feeling!
                const rect = card.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                // Only burst if the card is inside active viewport bounds
                if (x > 0 && x < window.innerWidth && y > 0 && y < window.innerHeight) {
                    triggerConfettiBurst(x, y, 6);
                }
            }, delay);
            window.galleryTimers.push(timer);
        });
    } else {
        // Reset state so animations replay on next gallery view entry
        cards.forEach(card => card.classList.remove('reveal'));
    }

    // Auto scroll to top on screen swap
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Bind Navigation Links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        navigateToView(targetId);
    });
});

/* ==========================================================================
   EVASIVE "NO" BUTTON (SMART VIEWPORT BOUNDS)
   ========================================================================== */
const btnNo = document.getElementById('btn-no');

function moveButtonRandomly(e) {
    // Add evasive styling on first run
    if (!btnNo.classList.contains('evasive')) {
        btnNo.classList.add('evasive');
    }

    const btnWidth = btnNo.offsetWidth;
    const btnHeight = btnNo.offsetHeight;
    
    // Viewport size minus safe margins and navbar padding
    const isMobile = window.innerWidth < 768;
    const navHeight = isMobile ? 64 : 75;
    
    const marginX = 20;
    const marginTop = navHeight + 20; // Safe area below top sticky navbar
    const marginBottom = 20;
    
    const minX = marginX;
    const maxX = window.innerWidth - btnWidth - marginX;
    
    const minY = marginTop;
    const maxY = window.innerHeight - btnHeight - marginBottom;
    
    // Safety check for narrow screens
    if (maxX <= minX || maxY <= minY) return;

    let newX = Math.random() * (maxX - minX) + minX;
    let newY = Math.random() * (maxY - minY) + minY;

    // Get current touch/cursor location to avoid teleporting directly under it
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || window.innerWidth / 2;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || window.innerHeight / 2;

    const distance = Math.hypot(newX - clientX, newY - clientY);
    
    // If calculated coordinates are too close to current interaction point, nudge them away
    if (distance < 120) {
        newX = (newX + 180);
        if (newX > maxX) newX = minX + (newX % (maxX - minX));
        newY = (newY + 180);
        if (newY > maxY) newY = minY + (newY % (maxY - minY));
    }

    btnNo.style.left = `${newX}px`;
    btnNo.style.top = `${newY}px`;
    
    // Spawn subtle red heart trail particles where the button was clicked/hovered
    triggerConfettiBurst(clientX, clientY, 8);
}

// Bind mouseenter and touchstart events
btnNo.addEventListener('mouseenter', moveButtonRandomly);
btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent standard mobile tap fires
    moveButtonRandomly(e);
});

/* ==========================================================================
   PROPOSAL ACCEPTED ("YES" CLICK)
   ========================================================================== */
const btnYes = document.getElementById('btn-yes');

btnYes.addEventListener('click', (e) => {
    // Big confetti blast at the button coordinates
    const rect = btnYes.getBoundingClientRect();
    const blastX = rect.left + rect.width / 2;
    const blastY = rect.top + rect.height / 2;
    triggerConfettiBurst(blastX, blastY, 150);

    // Warm up the native HTML5 audio element on user click (unlocks unmuted autoplay permissions)
    const nativeAudio = document.getElementById('bg-audio');
    if (nativeAudio) {
        nativeAudio.play().then(() => {
            // Pause it immediately, so it pre-buffers silently until the user views the gallery!
            if (window.location.hash !== '#gallery') {
                nativeAudio.pause();
            }
        }).catch(err => console.log("Audio warmup pending: ", err));
    }

    // Lock navigation updates
    isUnlocked = true;
    
    // Update the Nav bar surprise tab to Unlocked!
    const navSurprise = document.getElementById('link-surprise');
    navSurprise.classList.remove('locked');
    navSurprise.classList.add('unlocked');
    navSurprise.removeAttribute('title');
    
    const surpriseIcon = document.getElementById('surprise-icon');
    surpriseIcon.className = 'fa-solid fa-gift animate-beat';
    surpriseIcon.style.color = 'hsl(var(--accent))';

    // Show unlocked section and hide locked warning
    document.getElementById('surprise-locked').classList.add('hidden');
    document.getElementById('surprise-unlocked').classList.remove('hidden');

    // Trigger secondary screen confetti loop
    setTimeout(() => {
        triggerConfettiBurst(window.innerWidth / 4, window.innerHeight / 2, 40);
        triggerConfettiBurst((window.innerWidth * 3) / 4, window.innerHeight / 2, 40);
    }, 600);

    // Auto navigate to the unlocked surprise screen after a sweet short delay
    setTimeout(() => {
        navigateToView('surprise');
    }, 1800);
});

/* ==========================================================================
   3D SURPRISE BOX REVEAL SYSTEM
   ========================================================================== */
const giftBox = document.getElementById('main-gift-box');
const letterOverlay = document.getElementById('letter-overlay');
const closeLetterBtn = document.getElementById('close-letter-btn');

giftBox.addEventListener('click', () => {
    if (giftBox.classList.contains('open')) return;

    giftBox.classList.add('open');
    
    // Box explosion particles
    const rect = giftBox.getBoundingClientRect();
    const boxCenterX = rect.left + rect.width / 2;
    const boxCenterY = rect.top + rect.height / 2;
    
    // Multiple burst layers for extra WOW!
    setTimeout(() => triggerConfettiBurst(boxCenterX, boxCenterY - 40, 100), 100);
    setTimeout(() => triggerConfettiBurst(boxCenterX - 30, boxCenterY - 60, 50), 300);
    setTimeout(() => triggerConfettiBurst(boxCenterX + 30, boxCenterY - 60, 50), 450);

    // Slowly lift and display love letter
    setTimeout(() => {
        letterOverlay.classList.add('show');
    }, 1300);
});

// Close Letter Modal
closeLetterBtn.addEventListener('click', () => {
    letterOverlay.classList.remove('show');
    
    // Reset the box so they can click to open it again!
    setTimeout(() => {
        giftBox.classList.remove('open');
    }, 1000);
});

/* ==========================================================================
   PREMIUM GALLERY LIGHTBOX SYSTEM (ONE BY ONE VIEW)
   ========================================================================== */
const galleryItems = document.querySelectorAll('.gallery-card-item');
const lightbox = document.getElementById('gallery-lightbox');
const lightboxContent = document.getElementById('lightbox-content');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxPrev = document.getElementById('lightbox-prev-btn');
const lightboxNext = document.getElementById('lightbox-next-btn');
const closeLightboxBtn = document.getElementById('close-lightbox-btn');

let currentGalleryIndex = 0;
let mediaList = [];

// Parse media elements and assign index click bindings
galleryItems.forEach((item, index) => {
    const img = item.querySelector('.gallery-img');
    const video = item.querySelector('.gallery-video');
    const title = item.querySelector('.card-title').innerText;
    const desc = item.querySelector('.card-desc').innerText;
    const category = item.querySelector('.card-category').innerText;
    
    let type = 'image';
    let src = '';
    
    if (img) {
        type = 'image';
        src = img.getAttribute('src');
    } else if (video) {
        type = 'video';
        const source = video.querySelector('source');
        src = source ? source.getAttribute('src') : video.getAttribute('src');
    }
    
    mediaList.push({ type, src, title, desc, category });
    
    // Open full-screen lightbox upon clicking any card item
    item.addEventListener('click', () => {
        openLightbox(index);
    });
});

function openLightbox(index) {
    currentGalleryIndex = index;
    updateLightboxMedia();
    lightbox.classList.remove('hidden');
    setTimeout(() => {
        lightbox.classList.add('show');
    }, 50);
}

function updateLightboxMedia() {
    const data = mediaList[currentGalleryIndex];
    lightboxContent.innerHTML = '';
    
    const nativeAudio = document.getElementById('bg-audio');
    
    if (data.type === 'image') {
        const imgEl = document.createElement('img');
        imgEl.src = data.src;
        imgEl.className = 'lightbox-media-el fade-in';
        imgEl.alt = data.title;
        lightboxContent.appendChild(imgEl);
        
        // If background music is paused (e.g. from previous video slide), resume it unmuted!
        if (nativeAudio && nativeAudio.paused && audioStarted) {
            nativeAudio.play().catch(err => console.log(err));
        }
    } else if (data.type === 'video') {
        const vidEl = document.createElement('video');
        vidEl.src = data.src;
        vidEl.className = 'lightbox-media-el fade-in';
        vidEl.controls = true;
        vidEl.autoplay = true;
        vidEl.playsInline = true;
        vidEl.loop = true;
        vidEl.muted = false; // Enable video volume so they can hear the video's custom sound!
        lightboxContent.appendChild(vidEl);
        
        // Temporarily pause main background proposal song while memory video plays with audio
        if (nativeAudio) {
            nativeAudio.pause();
        }
    }
    
    // Populate card textual descriptors
    lightboxCaption.innerHTML = `
        <span class="lightbox-category">${data.category}</span>
        <h3 class="lightbox-title">${data.title}</h3>
        <p class="lightbox-desc">${data.desc}</p>
    `;
}

function closeLightbox() {
    lightbox.classList.remove('show');
    
    // Clear elements to stop media stream playing in the background
    setTimeout(() => {
        lightboxContent.innerHTML = '';
        lightbox.classList.add('hidden');
    }, 400);
    
    // Resume background proposal music unmuted if we're still looking at the gallery
    const nativeAudio = document.getElementById('bg-audio');
    if (nativeAudio && nativeAudio.paused && audioStarted) {
        nativeAudio.play().catch(err => console.log(err));
    }
}

function nextMedia() {
    currentGalleryIndex = (currentGalleryIndex + 1) % mediaList.length;
    updateLightboxMedia();
}

function prevMedia() {
    currentGalleryIndex = (currentGalleryIndex - 1 + mediaList.length) % mediaList.length;
    updateLightboxMedia();
}

// Button triggers
closeLightboxBtn.addEventListener('click', closeLightbox);
lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation(); // Avoid outer-wrap backdrop closures
    nextMedia();
});
lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    prevMedia();
});

// Click outside media container boundaries to close modal
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content-container')) {
        closeLightbox();
    }
});

// Swipe gestures for Galaxy A35 and responsive smartphones
let touchStartX = 0;
let touchEndX = 0;

lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
}, { passive: true });

function handleSwipeGesture() {
    const swipeThreshold = 55;
    if (touchEndX < touchStartX - swipeThreshold) {
        nextMedia(); // Swiped Left -> Load next element
    } else if (touchEndX > touchStartX + swipeThreshold) {
        prevMedia(); // Swiped Right -> Load previous element
    }
}

// Arrow Key Bindings
document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('show')) {
        if (e.key === 'ArrowRight') nextMedia();
        if (e.key === 'ArrowLeft') prevMedia();
        if (e.key === 'Escape') closeLightbox();
    }
});

