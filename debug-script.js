// Comprehensive Error Logging and Debugging Script
console.log('=== ASTRA WEBSITE INITIALIZATION START ===');
console.log('Timestamp:', new Date().toISOString());

// Check if required libraries are loaded
console.log('\n--- Library Check ---');
console.log('GSAP loaded:', typeof gsap !== 'undefined');
console.log('ScrollTrigger loaded:', typeof ScrollTrigger !== 'undefined');
console.log('LocomotiveScroll loaded:', typeof LocomotiveScroll !== 'undefined');

// Initialize Locomotive Scroll with error handling
let scroll;
try {
    const scrollContainer = document.querySelector('[data-scroll-container]');
    console.log('\n--- Locomotive Scroll Init ---');
    console.log('Scroll container found:', !!scrollContainer);
    
    if (scrollContainer) {
        scroll = new LocomotiveScroll({
            el: scrollContainer,
            smooth: true,
            multiplier: 1,
            smartphone: { smooth: true },
            tablet: { smooth: true }
        });
        console.log('✓ Locomotive Scroll initialized successfully');
    } else {
        console.error('✗ Scroll container [data-scroll-container] not found!');
    }
} catch (error) {
    console.error('✗ Locomotive Scroll initialization failed:', error.message);
    console.error('Stack:', error.stack);
}

// Check all required DOM elements
console.log('\n--- DOM Elements Check ---');
const elements = {
    'Featured Section': document.getElementById('featuredSection'),
    'Yellow Background': document.getElementById('yellowBg'),
    'Wrapper': document.querySelector('.wrapper'),
    'Hero Section': document.querySelector('.section.hero'),
    'Parallax Image': document.querySelector('.image-container img'),
    'Search Button': document.getElementById('searchBtn'),
    'Search Overlay': document.getElementById('searchOverlay'),
    'Play/Pause Button': document.getElementById('playPauseBtn')
};

Object.entries(elements).forEach(([name, element]) => {
    console.log(`${element ? '✓' : '✗'} ${name}:`, !!element);
});

// Export for use in main script
window.debugInfo = {
    scroll,
    elements,
    timestamp: Date.now()
};

console.log('\n=== DEBUG SCRIPT COMPLETE ===');
