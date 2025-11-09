// Landing Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    startBrewAnimation();
    startFeaturePanels();
});

let currentPanel = 0;
let panelInterval;

function startFeaturePanels() {
    const panels = document.querySelectorAll('.feature-panel');
    const dots = document.querySelectorAll('.feature-panel-dots .dot');
    
    if (panels.length === 0) return;
    
    // Clear any existing interval
    if (panelInterval) {
        clearInterval(panelInterval);
    }
    
    // Auto-rotate panels every 4 seconds
    panelInterval = setInterval(() => {
        // Remove active class from current panel and dot
        panels[currentPanel].classList.remove('active');
        const allDots = document.querySelectorAll('.feature-panel-dots .dot');
        allDots[currentPanel].classList.remove('active');
        
        // Move to next panel
        currentPanel = (currentPanel + 1) % panels.length;
        
        // Add active class to new panel and dot
        panels[currentPanel].classList.add('active');
        allDots[currentPanel].classList.add('active');
    }, 4000);
    
    // Add click handlers to dots (only once, using a flag)
    if (!dots[0].hasAttribute('data-listener-added')) {
        dots.forEach((dot, index) => {
            dot.setAttribute('data-listener-added', 'true');
            dot.addEventListener('click', () => {
                // Clear interval
                clearInterval(panelInterval);
                
                // Remove active from all
                panels.forEach(p => p.classList.remove('active'));
                document.querySelectorAll('.feature-panel-dots .dot').forEach(d => d.classList.remove('active'));
                
                // Set new active
                currentPanel = index;
                panels[currentPanel].classList.add('active');
                dot.classList.add('active');
                
                // Restart interval
                startFeaturePanels();
            });
        });
    }
}

function startBrewAnimation() {
    const cauldron = document.getElementById('brewingCauldron');
    const liquid = document.getElementById('cauldronLiquid');
    
    // Animate cauldron liquid
    setInterval(() => {
        const level = Math.random() * 30 + 50; // 50-80% full
        liquid.style.height = level + '%';
        
        // Change color based on "health"
        const hue = Math.random() * 60 + 120; // Green to yellow range
        liquid.style.background = `linear-gradient(to top, 
            hsla(${hue}, 70%, 50%, 0.8) 0%, 
            hsla(${hue + 20}, 60%, 60%, 0.6) 100%)`;
    }, 2000);
}

function beginJourney() {
    // Scroll to auth section or redirect to brew page
    const authSection = document.querySelector('.auth-section');
    if (authSection) {
        authSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        window.location.href = 'brew.html';
    }
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    // Update button active states
    document.querySelectorAll('.btn-outline-primary').forEach(btn => {
        if (btn.textContent.trim() === 'Login') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function showSignup() {
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    // Update button active states
    document.querySelectorAll('.btn-outline-primary').forEach(btn => {
        if (btn.textContent.trim() === 'Sign Up') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    if (email) {
        alert(`Magic link sent to ${email}! (Demo mode - redirecting to Brew page)`);
        setTimeout(() => {
            window.location.href = 'brew.html';
        }, 1000);
    } else {
        alert('Please enter your email');
    }
}

function handleSignup() {
    const email = document.getElementById('signupEmail').value;
    const name = document.getElementById('signupName').value;
    if (email && name) {
        alert(`Welcome ${name}! Account created. (Demo mode - redirecting to Brew page)`);
        setTimeout(() => {
            window.location.href = 'brew.html';
        }, 1000);
    } else {
        alert('Please fill in all fields');
    }
}
