// Shared Navigation Component
function createNavbar(currentPage) {
    const navItems = [
        { name: 'Brew', href: 'brew.html', icon: '<span style="color: #667eea; font-size: 1.3em;">⚗</span>' },
        { name: 'Ingredients', href: 'ingredients.html', icon: '<span style="color: #764ba2; font-size: 1.3em;">⚛</span>' },
        { name: 'Academy', href: 'academy.html', icon: '<span style="color: #4facfe; font-size: 1.3em;">▣</span>' },
        { name: 'Leaderboard', href: 'leaderboard.html', icon: '<span style="color: #00f2fe; font-size: 1.3em;">◈</span>' }
    ];

    return `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark magical-nav">
            <div class="container">
                <a class="navbar-brand" href="index.html">
                    <img src="/images/logo.png" alt="BudgetBrew Logo" class="brand-logo" style="display: inline-block; height: 55px; width: auto;"> BudgetBrew
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        ${navItems.map(item => `
                            <li class="nav-item">
                                <a class="nav-link ${currentPage === item.name.toLowerCase() ? 'active' : ''}" href="${item.href}">
                                    <span class="nav-icon">${item.icon}</span> ${item.name}
                                </a>
                            </li>
                        `).join('')}
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="profileDropdown" role="button" data-bs-toggle="dropdown">
                                <span class="nav-icon" style="color: #a78bfa; font-size: 1.3em;">◉</span> Profile
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item" href="#" onclick="showSettings()"><span style="color: #667eea; font-size: 1.2em;">⚙</span> Settings</a></li>
                                <li><a class="dropdown-item" href="#" onclick="showAchievements()"><span style="color: #f093fb; font-size: 1.2em;">★</span> Achievements</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="#" onclick="handleLogout()"><span style="color: #ff6b6b; font-size: 1.2em;">◐</span> Logout</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `;
}

function showSettings() {
    alert('Settings panel coming soon!');
}

function showAchievements() {
    alert('Achievements panel coming soon!');
}

async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Sign out from Firebase if available
        if (typeof signOut === 'function') {
            try {
                await signOut();
            } catch (error) {
                console.error('Error signing out:', error);
            }
        }
        window.location.href = 'index.html';
    }
}

