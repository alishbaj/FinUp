// Brew Dashboard JavaScript

const API_BASE_URL = 'http://localhost:3000/api';

// Auto-refresh user data every 30 seconds to show updated metrics
setInterval(async () => {
    if (typeof loadCurrentUserData === 'function') {
        await loadCurrentUserData();
    }
}, 30000);

// Spending categories with colors (for category bubbles display) - themed colors with interesting symbols
const categories = [
    { name: 'Food', color: '#f093fb', icon: '◉' },
    { name: 'Transport', color: '#667eea', icon: '◐' },
    { name: 'Entertainment', color: '#764ba2', icon: '◊' },
    { name: 'Shopping', color: '#4facfe', icon: '◈' },
    { name: 'Bills', color: '#00f2fe', icon: '◑' },
    { name: 'Health', color: '#a78bfa', icon: '◉' }
];

// Mock spending categories data (percentages of monthly budget) for cauldron bubbles - themed colors
const spendingCategories = [
    { name: 'Food', percent: 25, color: 'rgba(240, 147, 251, 0.7)' },
    { name: 'Housing', percent: 30, color: 'rgba(102, 126, 234, 0.7)' },
    { name: 'Utilities', percent: 10, color: 'rgba(118, 75, 162, 0.7)' },
    { name: 'Transportation', percent: 15, color: 'rgba(79, 172, 254, 0.7)' },
    { name: 'Healthcare', percent: 8, color: 'rgba(0, 242, 254, 0.7)' },
    { name: 'Entertainment', percent: 7, color: 'rgba(167, 139, 250, 0.7)' },
    { name: 'Miscellaneous', percent: 5, color: 'rgba(200, 200, 200, 0.7)' }
];

document.addEventListener('DOMContentLoaded', async () => {
    // Load current user data
    await loadCurrentUserData();
    // Randomize cauldron on page load
    randomizeCauldronOnLoad();
});

// Load current authenticated user's data
async function loadCurrentUserData() {
    try {
        // Try to get authenticated user
        if (typeof getCurrentUser === 'function' && getCurrentUser()) {
            // Use authenticated fetch
            if (typeof getCurrentUserData === 'function') {
                const userData = await getCurrentUserData();
                if (userData) {
                    displayBrewData(userData);
                    return;
                }
            }
            
            // Fallback: try /api/user/me endpoint
            if (typeof authenticatedFetch === 'function') {
                const response = await authenticatedFetch(`${API_BASE_URL}/user/me`);
                if (response.ok) {
                    const userData = await response.json();
                    displayBrewData(userData);
                    return;
                }
            }
        }
        
        // Fallback to default user (ID: 1)
        loadUserData('1');
    } catch (error) {
        console.error('Error loading current user data:', error);
        // Fallback to default user
        loadUserData('1');
    }
}

function randomizeCauldronOnLoad() {
    // Generate a random budget score between 20-90%
    const randomScore = Math.floor(Math.random() * 71) + 20;
    // Update the cauldron with this random score
    updateBudgetScoreCauldron(randomScore);
}

async function loadUserData(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        displayBrewData(userData);
    } catch (error) {
        console.error('Error loading user data:', error);
        alert('Failed to load user data. Make sure the server is running.');
    }
}

// Calculate budget score from user data (using budgetAdherence as base)
function calculateBudgetScore(userData) {
    // Budget score represents how well you're staying within budget
    // Lower is better (under 50% = good, over 50% = bad/overflowing)
    // We'll use budgetAdherence inversely - if adherence is low, score is high (bad)
    // If adherence is high, score is low (good)
    const adherence = userData.budgetAdherence;
    // Convert: 100% adherence = 0% score (excellent), 0% adherence = 100% score (terrible)
    return 100 - adherence;
}

// Get budget score description based on quartile
function getBudgetScoreDescription(score) {
    if (score <= 25) {
        return {
            title: '<span style="color: #f093fb;">★</span> Excellent Budget Control!',
            description: 'Your cauldron is stable and well-managed. Keep up the great work!',
            animation: 'good',
            color: 'rgba(67, 233, 123, 0.8)'
        };
    } else if (score <= 50) {
        return {
            title: '<span style="color: #667eea;">◉</span> Good Budget Management',
            description: 'Your spending is under control. You\'re on the right track!',
            animation: 'good',
            color: 'rgba(102, 126, 234, 0.8)'
        };
    } else if (score <= 75) {
        return {
            title: '<span style="color: #ff6b6b;">▲</span> Cauldron Overflowing!',
            description: 'You\'re spending more than planned. Time to review your expenses.',
            animation: 'overflowing',
            color: 'rgba(255, 193, 7, 0.8)'
        };
    } else {
        return {
            title: '<span style="color: #ff6b6b;">◈</span> Critical Overflow!',
            description: 'Your budget is severely over. Immediate action needed to stabilize.',
            animation: 'overflowing',
            color: 'rgba(255, 107, 107, 0.8)'
        };
    }
}

// Create category bubbles in cauldron
function createCategoryBubblesInCauldron() {
    const container = document.getElementById('categoryBubblesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Calculate total for normalization
    const total = spendingCategories.reduce((sum, cat) => sum + cat.percent, 0);
    
    // Position bubbles in cauldron (avoiding overlap)
    spendingCategories.forEach((category, index) => {
        const bubble = document.createElement('div');
        bubble.className = 'category-bubble-large';
        
        // Size proportional to percentage (min 40px, max 120px)
        const size = Math.max(40, Math.min(120, (category.percent / total) * 200));
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.backgroundColor = category.color;
        bubble.style.animationDelay = (index * 0.2) + 's';
        
        // Position bubbles to avoid overlap - distribute evenly
        const angle = (index / spendingCategories.length) * Math.PI * 2;
        const radius = 30 + (index % 2) * 10; // Vary radius slightly
        const centerX = 50; // Center of cauldron
        const centerY = 25; // Vertical center of liquid area
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        bubble.style.left = x + '%';
        bubble.style.bottom = y + '%';
        
        // Add content
        bubble.innerHTML = `
            <div class="bubble-percent">${category.percent}%</div>
            <div class="bubble-category">${category.name}</div>
        `;
        
        container.appendChild(bubble);
    });
}

// Create sparks based on budget score
function createSparks(score) {
    const container = document.getElementById('sparksContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const isGood = score <= 50;
    const sparkCount = isGood ? 5 : 8; // More sparks for bad scores
    const sparkColor = isGood ? '#4ecdc4' : '#ff6b6b';
    
    for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark-landing';
        spark.style.background = sparkColor;
        spark.style.left = Math.random() * 100 + '%';
        spark.style.top = Math.random() * 100 + '%';
        spark.style.animationDelay = (i * 0.3) + 's';
        container.appendChild(spark);
    }
}

// Update cauldron based on budget score
function updateBudgetScoreCauldron(score) {
    const liquid = document.getElementById('mainCauldronLiquid');
    const title = document.getElementById('cauldronTitle');
    const description = document.getElementById('cauldronDescription');
    const scoreValue = document.getElementById('budgetScoreValue');
    const scoreLabel = document.querySelector('.budget-score-value');
    
    if (!liquid || !title || !description || !scoreValue) return;
    
    const info = getBudgetScoreDescription(score);
    
    // Update liquid level (score represents percentage)
    // For overflowing (bad), show liquid above 50%
    // For good, show liquid below 50%
    const liquidLevel = score;
    liquid.style.height = liquidLevel + '%';
    liquid.style.background = `linear-gradient(to top, ${info.color} 0%, ${info.color.replace('0.8', '0.6')} 100%)`;
    
    // Add animation class
    liquid.className = 'cauldron-liquid-landing ' + info.animation;
    
    // Update text
    title.innerHTML = info.title;
    description.textContent = info.description;
    scoreValue.textContent = score;
    if (scoreLabel) {
        scoreLabel.style.color = score <= 50 ? '#4ecdc4' : '#ff6b6b';
    }
    
    // Create sparks
    createSparks(score);
}

function displayBrewData(userData) {
    // Calculate budget score
    const budgetScore = calculateBudgetScore(userData);
    
    // Update potion stability (FinScore)
    const stability = userData.finScore;
    document.getElementById('potionStability').textContent = stability.toFixed(1) + '%';
    document.getElementById('stabilityFill').style.width = stability + '%';
    
    // Update budget score cauldron
    updateBudgetScoreCauldron(budgetScore);
    
    // Create category bubbles in cauldron
    createCategoryBubblesInCauldron();
    
    // Update metrics
    document.getElementById('budgetAdherence').textContent = userData.budgetAdherence + '%';
    document.getElementById('savingProgress').textContent = userData.savingProgress + '%';
    document.getElementById('investmentPerformance').textContent = userData.investmentPerformance + '%';
    document.getElementById('quizScore').textContent = userData.quizScore + '%';
    
    document.getElementById('budgetProgress').style.width = userData.budgetAdherence + '%';
    document.getElementById('savingProgressBar').style.width = userData.savingProgress + '%';
    document.getElementById('investmentProgress').style.width = userData.investmentPerformance + '%';
    document.getElementById('quizProgress').style.width = userData.quizScore + '%';
    
    // Generate spending category bubbles (for the section below)
    generateCategoryBubbles(userData);
    
    // Generate trend sparks
    generateTrendSparks(userData);
    
    // Generate AI summary
    generateAISummary(userData);
}

function generateCategoryBubbles(userData) {
    const container = document.getElementById('categoryBubbles');
    container.innerHTML = '';
    
    // Simulate spending per category
    categories.forEach((category, index) => {
        const spending = Math.random() * 30 + 10; // 10-40% per category
        const bubble = document.createElement('div');
        bubble.className = 'category-bubble';
        bubble.style.backgroundColor = category.color;
        bubble.style.animationDelay = (index * 0.2) + 's';
        const iconMap = {
            'Food': '◉',
            'Transport': '◐',
            'Entertainment': '◊',
            'Shopping': '◈',
            'Bills': '◑',
            'Health': '◉'
        };
        bubble.innerHTML = `
            <span class="bubble-icon" style="color: ${category.color}; font-size: 1.3em;">${iconMap[category.name] || '●'}</span>
            <span class="bubble-label">${category.name}</span>
            <span class="bubble-amount">$${Math.round(spending * 10)}</span>
        `;
        bubble.onclick = () => showCategoryBreakdown(category.name);
        container.appendChild(bubble);
    });
}

function generateTrendSparks(userData) {
    const container = document.getElementById('trendSparks');
    container.innerHTML = '';
    
    // Generate color-coded trend sparks
    const trends = [
        { type: 'positive', color: '#4ecdc4', icon: '↑' },
        { type: 'neutral', color: '#ffe66d', icon: '→' },
        { type: 'negative', color: '#ff6b6b', icon: '↓' }
    ];
    
    trends.forEach((trend, index) => {
        const spark = document.createElement('div');
        spark.className = 'trend-spark';
        spark.style.color = trend.color;
        spark.style.animationDelay = (index * 0.3) + 's';
        spark.textContent = trend.icon;
        spark.title = `${trend.type} trend`;
        container.appendChild(spark);
    });
}

function generateAISummary(userData) {
    const container = document.getElementById('aiSummary');
    
    // Generate AI summary based on user data
    let summary = '';
    
    if (userData.finScore >= 80) {
        summary = `<span style="color: #f093fb;">★</span> Excellent! Your financial potion is highly stable. Your budget adherence of ${userData.budgetAdherence}% shows great discipline. Keep brewing!`;
    } else if (userData.finScore >= 60) {
        summary = `<span style="color: #667eea;">✦</span> Good progress! Your potion stability is at ${userData.finScore.toFixed(1)}%. Focus on improving your ${userData.budgetAdherence < 70 ? 'budget adherence' : userData.savingProgress < 70 ? 'saving progress' : 'investment performance'} to boost your score.`;
    } else {
        summary = `<span style="color: #764ba2;">◉</span> Your potion needs more stability. Consider reviewing your spending habits and setting clearer budget goals. Your current score is ${userData.finScore.toFixed(1)}%.`;
    }
    
    summary += `\n\n<span style="color: #4facfe;">●</span> This week: Your spending patterns show ${userData.budgetAdherence >= 80 ? 'excellent' : userData.budgetAdherence >= 60 ? 'good' : 'room for improvement'} budget control.`;
    
    container.innerHTML = `<p>${summary}</p>`;
}

function showCategoryBreakdown(categoryName) {
    alert(`Category breakdown for ${categoryName}:\n\nThis feature will show detailed spending analysis for this category.`);
}

