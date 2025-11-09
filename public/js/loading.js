// Loading Screen Manager

let isLoading = false;
let revealObserver = null;

// Initialize loading screen HTML
function initLoadingScreen() {
    if (document.getElementById('loadingOverlay')) {
        return; // Already initialized
    }
    
    const loadingHTML = `
        <div id="loadingOverlay" class="loading-overlay">
            <div class="loading-animation-container">
                <div class="bubble-pop-animation"></div>
                <div class="loading-text">Brewing...</div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
}

// Show loading screen
function showLoading() {
    initLoadingScreen();
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('active');
        isLoading = true;
    }
}

// Hide loading screen
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        isLoading = false;
    }
}

// Handle page navigation with loading screen
function navigateWithLoading(url) {
    if (isLoading) return; // Prevent multiple navigations
    
    showLoading();
    
    // Small delay to ensure animation is visible (doubled from 300ms to 600ms)
    setTimeout(() => {
        window.location.href = url;
    }, 600);
}

// Intercept all navigation links
document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initScrollReveals();
    
    // Intercept all internal navigation links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Only intercept internal links (not external URLs, anchors, or special links)
        if (href.startsWith('http://') || href.startsWith('https://') || 
            href.startsWith('#') || href.startsWith('mailto:') || 
            href.startsWith('tel:') || href === 'javascript:void(0)') {
            return;
        }
        
        // Check if it's an internal page navigation
        if (href.endsWith('.html') || href === '/' || href === 'index.html' || 
            href.includes('brew.html') || href.includes('ingredients.html') || 
            href.includes('potions.html') || href.includes('academy.html') || 
            href.includes('leaderboard.html') || href.includes('quiz.html')) {
            
            e.preventDefault();
            navigateWithLoading(href);
        }
    });
    
    // Hide loading screen when page is fully loaded (doubled from 500ms to 1000ms)
    window.addEventListener('load', () => {
        setTimeout(() => {
            hideLoading();
        }, 1000);
    });
    
    // Also hide on pageshow event (for back/forward navigation)
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            // Page was loaded from cache
            hideLoading();
        }
    });
});

// Show loading immediately if page is still loading
if (document.readyState === 'loading') {
    showLoading();
}

function initScrollReveals() {
    const observer = ensureRevealObserver();
    if (!observer) return;

    const candidates = document.querySelectorAll('[data-reveal], .magical-card, .feature-panel, .cauldron-dashboard, .category-bubble, .coach-card, .recap-card');
    candidates.forEach((element) => {
        registerRevealElement(element);
    });
}

function registerRevealElement(element) {
    const observer = ensureRevealObserver();
    if (!element || !('classList' in element) || !observer) return;

    if (!element.classList.contains('reveal-on-scroll')) {
        element.classList.add('reveal-on-scroll');
    }
    observer.observe(element);
}

function ensureRevealObserver() {
    if (!('IntersectionObserver' in window)) return null;

    if (!revealObserver) {
        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -10% 0px'
        });
    }

    return revealObserver;
}

window.registerRevealElement = registerRevealElement;
window.refreshScrollReveal = initScrollReveals;

