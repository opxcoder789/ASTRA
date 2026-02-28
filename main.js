/**
 * ASTRA Sneaker Website - Main JavaScript
 * Handles all interactive functionality
 */

// Wait for all deferred scripts to load
window.addEventListener('DOMContentLoaded', function() {
    // Check if required libraries are loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('Waiting for libraries to load...');
        setTimeout(initializeApp, 100);
        return;
    }
    initializeApp();
});

function initializeApp() {
    // Wrap all initialization in a function to avoid blocking
    requestAnimationFrame(() => {
        console.log('Initializing ASTRA website...');
        
        // Initialize all modules
        initScrollEffects();
        initSearchOverlay();
        initHamburgerMenu();
        initLanguageSystem();
        initAnimations();
        initVideoControls();
        initLoadingSpinner();
    });
}

// ========================================
// SCROLL EFFECTS
// ========================================
function initScrollEffects() {
    const mainHeader = document.getElementById('mainHeader');
    const stickyNav = document.getElementById('stickyNav');
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header size on scroll
        if (scrollY > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }

        // Show sticky nav when scrolling down past hero section (mobile only)
        if (window.innerWidth <= 768) {
            if (scrollY > window.innerHeight * 0.8 && scrollY > lastScrollY) {
                stickyNav.classList.add('show');
            } else if (scrollY < window.innerHeight * 0.5 || scrollY < lastScrollY) {
                stickyNav.classList.remove('show');
            }
        }

        lastScrollY = scrollY;
    });
}

// ========================================
// SEARCH OVERLAY
// ========================================
function initSearchOverlay() {
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchCancel = document.getElementById('searchCancel');
    const searchInput = document.getElementById('searchInput');

    searchBtn.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            searchInput.focus();
        }, 400);
    });

    searchCancel.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
        searchInput.value = '';
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (searchOverlay.classList.contains('active')) {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
                searchInput.value = '';
            }
            const menuOverlay = document.getElementById('menuOverlay');
            if (menuOverlay && menuOverlay.classList.contains('active')) {
                menuOverlay.classList.remove('active');
                const hamburgerBtn = document.getElementById('hamburgerBtn');
                if (hamburgerBtn) hamburgerBtn.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
}

// ========================================
// HAMBURGER MENU
// ========================================
function initHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuClose = document.getElementById('menuClose');

    hamburgerBtn.addEventListener('click', () => {
        menuOverlay.classList.add('active');
        hamburgerBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    menuClose.addEventListener('click', () => {
        menuOverlay.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close menu when clicking outside content
    menuOverlay.addEventListener('click', (e) => {
        if (e.target === menuOverlay) {
            menuOverlay.classList.remove('active');
            hamburgerBtn.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ========================================
// LANGUAGE SYSTEM
// ========================================
function initLanguageSystem() {
    // Language toggle in hamburger menu
    const languageToggle = document.getElementById('menuLanguageToggle');
    const languageOptions = document.getElementById('menuLanguageOptions');
    const languageOptionItems = document.querySelectorAll('#menuLanguageOptions .language-option');
    const menuLangEn = document.getElementById('menuLangEn');
    const menuLangHi = document.getElementById('menuLangHi');

    // Set initial active state based on localStorage
    const currentLang = localStorage.getItem('astraLanguage') || 'en';
    if (currentLang === 'hi') {
        menuLangHi.classList.add('active');
        menuLangEn.classList.remove('active');
    } else {
        menuLangEn.classList.add('active');
        menuLangHi.classList.remove('active');
    }

    if (languageToggle && languageOptions) {
        languageToggle.addEventListener('click', () => {
            languageOptions.classList.toggle('show');
        });

        languageOptionItems.forEach(option => {
            option.addEventListener('click', () => {
                const newLang = option.getAttribute('data-lang');
                
                // Remove active class from all options
                languageOptionItems.forEach(opt => opt.classList.remove('active'));
                // Add active class to clicked option
                option.classList.add('active');
                
                // Save to localStorage
                localStorage.setItem('astraLanguage', newLang);
                localStorage.setItem('astraLanguageSelected', 'true');
                
                // Apply language changes
                if (newLang === 'hi') {
                    applyHindiTranslations();
                } else {
                    applyEnglishTranslations();
                }
                
                // Close the language options after selection
                setTimeout(() => {
                    languageOptions.classList.remove('show');
                }, 500);
            });
        });
    }

    // Language bar functionality
    const languageBar = document.getElementById('languageBar');
    const languageButtons = document.querySelectorAll('.language-option-btn');
    const languageContinue = document.getElementById('languageContinue');
    const languageCancel = document.getElementById('languageCancel');
    let selectedLanguage = localStorage.getItem('astraLanguage') || 'en';

    // Check if language was already selected
    const languageSelected = localStorage.getItem('astraLanguageSelected');
    if (languageSelected === 'true') {
        languageBar.style.display = 'none';
        if (selectedLanguage === 'hi') {
            applyHindiTranslations();
        }
    } else {
        // Set initial active button
        languageButtons.forEach(btn => {
            if (btn.getAttribute('data-lang') === selectedLanguage) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    languageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            languageButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedLanguage = btn.getAttribute('data-lang');
            localStorage.setItem('astraLanguage', selectedLanguage);
        });
    });

    languageContinue.addEventListener('click', () => {
        // Save selection to localStorage
        localStorage.setItem('astraLanguageSelected', 'true');
        
        // Hide language bar with animation
        languageBar.style.transform = 'translateY(-100%)';
        languageBar.style.opacity = '0';
        
        setTimeout(() => {
            languageBar.style.display = 'none';
            
            // Apply language changes
            if (selectedLanguage === 'hi') {
                applyHindiTranslations();
            } else {
                applyEnglishTranslations();
            }
        }, 300);
    });

    languageCancel.addEventListener('click', () => {
        // Hide language bar without saving
        languageBar.style.transform = 'translateY(-100%)';
        languageBar.style.opacity = '0';
        
        setTimeout(() => {
            languageBar.style.display = 'none';
        }, 300);
    });
}

// Hindi Translations
function applyHindiTranslations() {
    // Hero Section
    const heroH1 = document.querySelector('.hero h1');
    const heroP = document.querySelector('.hero p');
    if (heroH1) heroH1.innerHTML = '<span>जमीन को</span> <span>कुचलने के लिए जन्मे</span>';
    if (heroP) heroP.textContent = 'गली क्रिकेट से लेकर दुनिया के सबसे बड़े मंच तक, खेल वही रहता है—आपको बाधाओं को हराना होगा।';
    
    // Buttons
    const customizationBtn = document.querySelector('.btn-customization span');
    const watchBtn = document.querySelector('.btn-watch span');
    if (customizationBtn) customizationBtn.textContent = 'अनुकूलित करें';
    if (watchBtn) watchBtn.textContent = 'देखें';
    
    // Featured Section
    const featuredHeader = document.querySelector('.section-header');
    if (featuredHeader) featuredHeader.textContent = 'विशेष रुप से प्रदर्शित';
    
    // New Arrivals
    const naHeader = document.querySelector('.na-header');
    if (naHeader) naHeader.textContent = 'नए आगमन';
    
    const browseBtn = document.querySelector('.browse-btn');
    if (browseBtn) browseBtn.textContent = 'सभी जूते ब्राउज़ करें';
    
    // Footer
    const footerBtn = document.querySelector('.btn-white');
    if (footerBtn) footerBtn.textContent = 'एस्ट्रा स्टोर पर जाएं';

    // Hamburger Menu Items
    updateHamburgerMenuLanguage('hi');
}

// English Translations (Reset)
function applyEnglishTranslations() {
    const heroH1 = document.querySelector('.hero h1');
    const heroP = document.querySelector('.hero p');
    if (heroH1) heroH1.innerHTML = '<span>BORN TO</span> <span>CRUSH LAND</span>';
    if (heroP) heroP.textContent = 'From gully cricket to the world\'s biggest stage, the game remains the same—you have to beat the odds.';
    
    const customizationBtn = document.querySelector('.btn-customization span');
    const watchBtn = document.querySelector('.btn-watch span');
    if (customizationBtn) customizationBtn.textContent = 'Customize';
    if (watchBtn) watchBtn.textContent = 'Watch';
    
    const featuredHeader = document.querySelector('.section-header');
    if (featuredHeader) featuredHeader.textContent = 'Featured';
    
    const naHeader = document.querySelector('.na-header');
    if (naHeader) naHeader.textContent = 'NEW ARRIVALS';
    
    const browseBtn = document.querySelector('.browse-btn');
    if (browseBtn) browseBtn.textContent = 'Browse All Shoes';
    
    const footerBtn = document.querySelector('.btn-white');
    if (footerBtn) footerBtn.textContent = 'GO TO ASTRA STORE';

    // Hamburger Menu Items
    updateHamburgerMenuLanguage('en');
}

// Update Hamburger Menu Language
function updateHamburgerMenuLanguage(lang) {
    const menuItems = document.querySelectorAll('.menu-item');
    const menuHeaders = document.querySelectorAll('.menu-header span');
    const categoryTitle = document.querySelector('.menu-category-title');
    const subcategory = document.querySelector('.menu-subcategory span');
    const paymentHeader = document.querySelector('.payment-header span');
    const rewardsItem = document.querySelector('.rewards-item span');
    const footerItems = document.querySelectorAll('.menu-footer-item span');
    const signinBtn = document.querySelector('.btn-signin');
    const signupBtn = document.querySelector('.btn-signup');

    if (lang === 'hi') {
        // Menu Header
        if (menuHeaders[0]) menuHeaders[0].textContent = 'जूते देखें';
        
        // Menu Items
        if (menuItems[0]) menuItems[0].textContent = 'नए आगमन';
        if (menuItems[1]) menuItems[1].textContent = 'सर्वश्रेष्ठ विक्रेता';
        if (menuItems[2]) menuItems[2].textContent = 'पसंदीदा';
        if (menuItems[3]) menuItems[3].textContent = 'मेरी कार्ट';
        if (menuItems[4]) menuItems[4].textContent = 'ऑर्डर ट्रैक करें';
        
        // Category
        if (categoryTitle) categoryTitle.textContent = 'जूते';
        if (subcategory) subcategory.textContent = 'स्नीकर्स';
        
        // Payment
        if (paymentHeader) paymentHeader.textContent = 'भुगतान';
        
        // Rewards
        if (rewardsItem) rewardsItem.textContent = 'पुरस्कार (जल्द आ रहा है)';
        
        // Footer Items
        if (footerItems[0]) footerItems[0].textContent = 'सेटिंग्स';
        if (footerItems[1]) footerItems[1].textContent = 'भाषा';
        if (footerItems[2]) footerItems[2].textContent = 'एस्ट्रा स्टोर';
        
        // Buttons
        if (signinBtn) signinBtn.textContent = 'साइन इन करें';
        if (signupBtn) signupBtn.textContent = 'साइन अप करें';
    } else {
        // English
        if (menuHeaders[0]) menuHeaders[0].textContent = 'Explore Shoes';
        
        if (menuItems[0]) menuItems[0].textContent = 'New Arrivals';
        if (menuItems[1]) menuItems[1].textContent = 'Best Sellers';
        if (menuItems[2]) menuItems[2].textContent = 'Favorites';
        if (menuItems[3]) menuItems[3].textContent = 'My Cart';
        if (menuItems[4]) menuItems[4].textContent = 'Track Order';
        
        if (categoryTitle) categoryTitle.textContent = 'Shoes';
        if (subcategory) subcategory.textContent = 'Sneakers';
        
        if (paymentHeader) paymentHeader.textContent = 'Payments';
        
        if (rewardsItem) rewardsItem.textContent = 'Rewards (coming soon)';
        
        if (footerItems[0]) footerItems[0].textContent = 'Settings';
        if (footerItems[1]) footerItems[1].textContent = 'Language';
        if (footerItems[2]) footerItems[2].textContent = 'Astra Store';
        
        if (signinBtn) signinBtn.textContent = 'SIGN IN';
        if (signupBtn) signupBtn.textContent = 'SIGN UP';
    }
}

// ========================================
// ANIMATIONS
// ========================================
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Section Animations
    gsap.to('.hero h1', {
        opacity: 1,
        x: 0,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.3
    });

    gsap.to('.hero p', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        delay: 0.6
    });

    gsap.to('.hero-btn-container', {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.7)',
        delay: 0.9
    });

    gsap.to('.play-pause-container', {
        opacity: 1,
        rotation: 0,
        scale: 1,
        duration: 1,
        ease: 'elastic.out(1, 0.5)',
        delay: 1.2
    });

    // Featured Section Animations
    const featuredSection = document.getElementById('featuredSection');
    const yellowBg = document.getElementById('yellowBg');
    
    ScrollTrigger.create({
        trigger: featuredSection,
        start: 'top 75%',
        end: 'top 25%',
        scrub: 1,
        onUpdate: (self) => {
            const progress = self.progress;
            gsap.to(yellowBg, {
                y: `${(1 - progress) * 100}%`,
                duration: 0.1,
                ease: 'none'
            });
            
            if (progress > 0.8) {
                featuredSection.classList.add('yellow-active');
            } else {
                featuredSection.classList.remove('yellow-active');
            }
        }
    });

    ScrollTrigger.create({
        trigger: featuredSection,
        start: 'top 70%',
        once: true,
        onEnter: () => {
            gsap.to('.section-header', {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                delay: 0.3
            });
            
            gsap.to('.feat-card', {
                opacity: 1,
                y: 0,
                duration: 1.2,
                stagger: 0.2,
                ease: 'power3.out',
                delay: 0.5
            });
        }
    });

    // Alternative scroll animation for featured section
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const featuredTop = featuredSection.offsetTop;
        const windowHeight = window.innerHeight;
        
        const triggerPoint = featuredTop - windowHeight * 0.7;
        const endPoint = featuredTop - windowHeight * 0.3;
        
        if (scrollY > triggerPoint && scrollY < endPoint) {
            const progress = (scrollY - triggerPoint) / (endPoint - triggerPoint);
            const clampedProgress = Math.max(0, Math.min(1, progress));
            yellowBg.style.transform = `translateY(${(1 - clampedProgress) * 100}%)`;
        } else if (scrollY >= endPoint) {
            yellowBg.style.transform = 'translateY(0%)';
        } else {
            yellowBg.style.transform = 'translateY(100%)';
        }
    });

    // Shoe Images Float Animation
    const shoeImages = document.querySelectorAll('.shoe-display img, .flying-shoes-container img');
    shoeImages.forEach((img, index) => {
        gsap.to(img, {
            y: -12,
            duration: 2 + (index * 0.25),
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: index * 0.15
        });
    });

    // Fold Effect Section Animation
    const foldEffectSection = document.querySelector('.fold-effect-section');
    if (foldEffectSection) {
        gsap.utils.toArray('.marquee').forEach((el, index) => {
            const track = el.querySelector('.track');
            const text = track.querySelector('.text');
            
            const clone = text.cloneNode(true);
            track.appendChild(clone);
            
            const [x, xEnd] = (index % 2 === 0) ? [0, -1000] : [0, -1500];
            
            gsap.fromTo(track, 
                { x }, 
                {
                    x: xEnd,
                    scrollTrigger: {
                        trigger: foldEffectSection,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1
                    }
                }
            );
        });

        const centerContent = document.getElementById('center-content');
        const centerFold = document.getElementById('center-fold');
        const foldsContent = Array.from(document.querySelectorAll('.fold-content'));

        if (centerContent && centerFold && foldsContent.length > 0) {
            window.addEventListener('scroll', () => {
                const scrollY = window.pageYOffset || document.documentElement.scrollTop;
                const sectionTop = foldEffectSection.offsetTop;
                const sectionHeight = foldEffectSection.offsetHeight;
                
                if (scrollY > sectionTop - window.innerHeight && scrollY < sectionTop + sectionHeight) {
                    const progress = (scrollY - (sectionTop - window.innerHeight)) / (sectionHeight + window.innerHeight);
                    const translateY = -(progress * centerContent.clientHeight * 0.5);
                    
                    foldsContent.forEach(content => {
                        content.style.transform = `translateY(${translateY}px)`;
                    });
                }
            });
        }
    }

    // Refresh ScrollTrigger on resize
    window.addEventListener('resize', () => {
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 300);
    });

    // Refresh after initial load
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 1500);
}

// ========================================
// VIDEO CONTROLS
// ========================================
function initVideoControls() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const heroVideo = document.querySelector('.hero-bg-video');
    const playPauseIcon = playPauseBtn ? playPauseBtn.querySelector('img') : null;
    
    if (playPauseBtn && heroVideo) {
        let isVideoPaused = false;
        
        playPauseBtn.addEventListener('click', () => {
            isVideoPaused = !isVideoPaused;
            
            if (isVideoPaused) {
                heroVideo.pause();
                playPauseBtn.style.opacity = '0.5';
                if (playPauseIcon) {
                    playPauseIcon.src = 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/uYQ1huV4zO/7f3xyr7d_expires_30_days.png';
                    playPauseBtn.setAttribute('aria-label', 'Play video');
                }
            } else {
                heroVideo.play();
                playPauseBtn.style.opacity = '1';
                if (playPauseIcon) {
                    playPauseIcon.src = 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/uYQ1huV4zO/x8w607oh_expires_30_days.png';
                    playPauseBtn.setAttribute('aria-label', 'Pause video');
                }
            }
        });
    }
}

// ========================================
// LOADING SPINNER
// ========================================
function initLoadingSpinner() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }, 3000);

    const heroVideo = document.querySelector('.hero-bg-video');
    if (heroVideo) {
        heroVideo.addEventListener('loadeddata', () => {
            console.log('Hero video loaded');
        });
    }

    const exploreVideo = document.querySelector('.explore-shoes-video');
    if (exploreVideo) {
        exploreVideo.addEventListener('loadeddata', () => {
            console.log('Explore video loaded');
        });
    }
}

// ========================================
// SERVICE WORKER REGISTRATION
// ========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker registration failed, continue without it
        });
    });
}
