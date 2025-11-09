// Brew Dashboard JavaScript

const API_BASE_URL = 'http://localhost:3000/api';
const DEFAULT_USER_ID = '1';

const MOCK_USER_PROFILES = [
    {
        id: '1',
        name: 'You',
        budgetAdherence: 78,
        savingProgress: 72,
        investmentPerformance: 66,
        quizScore: 84
    },
    {
        id: '2',
        name: 'Mira Solis',
        budgetAdherence: 81,
        savingProgress: 88,
        investmentPerformance: 74,
        quizScore: 92
    },
    {
        id: '3',
        name: 'Elias Ward',
        budgetAdherence: 69,
        savingProgress: 63,
        investmentPerformance: 71,
        quizScore: 76
    }
];

// Spending categories with colors (for category bubbles display) - themed colors with interesting symbols
const categories = [
    { name: 'Food', color: '#f093fb', icon: '◉' },
    { name: 'Transport', color: '#667eea', icon: '◐' },
    { name: 'Entertainment', color: '#764ba2', icon: '◊' },
    { name: 'Shopping', color: '#4facfe', icon: '◈' },
    { name: 'Bills', color: '#00f2fe', icon: '◑' },
    { name: 'Health', color: '#a78bfa', icon: '◉' }
];

let latestUserData = null;
let activeScenario = null;
const committedMicroGoals = [];

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

document.addEventListener('DOMContentLoaded', () => {
    // Load default user with graceful mock fallback
    loadUserData(DEFAULT_USER_ID);
    // Randomize cauldron on page load
    randomizeCauldronOnLoad();
    setupCoachInteractions();
});

function randomizeCauldronOnLoad() {
    // Generate a random budget score between 20-90%
    const randomScore = Math.floor(Math.random() * 71) + 20;
    // Update the cauldron with this random score
    updateBudgetScoreCauldron(randomScore);
}

async function loadUserData(userId) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        displayBrewData(userData);
    } catch (error) {
        console.error('Error loading user data:', error);
        const mockUser = getMockUserProfile(userId);
        displayBrewData(mockUser);
        surfaceMockBanner(mockUser);
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
        if (typeof window.registerRevealElement === 'function') {
            window.registerRevealElement(bubble);
        }
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
    latestUserData = userData;
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
    
    // Update goals
    updateGoals(userData);

    // Smart coach updates
    generateSmartCoach(userData);
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
        if (typeof window.registerRevealElement === 'function') {
            window.registerRevealElement(bubble);
        }
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

function updateGoals(userData) {
    // Short term goal (example: save $500)
    const shortTermProgress = userData.savingProgress;
    document.getElementById('shortTermFill').style.width = shortTermProgress + '%';
    document.getElementById('shortTermText').textContent = `Emergency Fund: ${shortTermProgress}% complete`;
    
    // Long term goal (example: retirement savings)
    const longTermProgress = userData.investmentPerformance;
    document.getElementById('longTermFill').style.width = longTermProgress + '%';
    document.getElementById('longTermText').textContent = `Retirement Savings: ${longTermProgress}% on track`;
}

function setupCoachInteractions() {
    const refreshBtn = document.getElementById('refreshScenarioBtn');
    const commitBtn = document.getElementById('commitMicroGoalBtn');

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (latestUserData) {
                generateSmartCoach(latestUserData, true);
            }
        });
    }

    if (commitBtn) {
        commitBtn.addEventListener('click', handleCommitMicroGoal);
    }
}

function generateSmartCoach(userData, forceNewScenario) {
    if (!userData) return;

    if (forceNewScenario || !activeScenario) {
        activeScenario = buildAdaptiveScenario(userData);
    }

    renderScenario(activeScenario);
    renderMicroGoals(userData);
    updateMonthlyRecap(userData);
    updateNextCheckIn(userData);
}

function buildAdaptiveScenario(userData) {
    const focusAreas = [
        { key: 'budgetAdherence', score: userData.budgetAdherence, label: 'budget', severity: 100 - userData.budgetAdherence },
        { key: 'savingProgress', score: userData.savingProgress, label: 'savings', severity: 100 - userData.savingProgress },
        { key: 'investmentPerformance', score: userData.investmentPerformance, label: 'investments', severity: Math.max(0, 70 - userData.investmentPerformance) },
        { key: 'quizScore', score: userData.quizScore, label: 'literacy', severity: Math.max(0, 75 - userData.quizScore) }
    ];

    focusAreas.sort((a, b) => b.severity - a.severity);
    const derivedPriority = determinePriorityArea(userData);
    const priority = derivedPriority ? { ...derivedPriority } : focusAreas[0];

    const scenarioTemplates = {
        budget: () => ({
            title: 'Check Your Dining & On-the-Go Spending',
            prompt: `Your brew shows spending intensity this week. You're trending ${Math.max(0, 100 - userData.budgetAdherence)}% over the budget lane. How do you rebalance before the potion overflows?`,
            microGoal: 'Cap dining-out budget at $40 until Sunday',
            baseMomentum: 12,
            choices: [
                {
                    label: 'Draft a 3-day spending freeze',
                    detail: 'Pause non-essential swipes until the weekend.',
                    momentumDelta: 4,
                    feedback: 'The freeze cools the cauldron immediately, opening room for savings.',
                    suggestedAction: 'Set a reminder to review receipts nightly.'
                },
                {
                    label: 'Swap one pricey habit for a frugal win',
                    detail: 'Cook two meals at home and reuse leftovers.',
                    momentumDelta: 6,
                    feedback: 'Smart swap! You reclaim wiggle room without feeling deprived.',
                    suggestedAction: 'Plan a simple meal-prep session tonight.'
                },
                {
                    label: 'Accept the overflow and adjust goals',
                    detail: 'Increase the dining budget for the rest of the month.',
                    momentumDelta: -3,
                    feedback: 'Adjusting is fine short-term, but the potion stays unstable longer.',
                    suggestedAction: 'Pair this with a savings boost elsewhere.'
                }
            ]
        }),
        savings: () => ({
            title: 'Savings Reservoir Running Low',
            prompt: `Your latest transfer dipped, leaving savings ${Math.max(0, 80 - userData.savingProgress)}% shy of its target. A quick infusion keeps the streak alive.`,
            microGoal: 'Auto-move $25 into savings by Friday',
            baseMomentum: 14,
            choices: [
                {
                    label: 'Schedule an automatic mini-transfer',
                    detail: 'Lock in a $25 top-up before the weekend.',
                    momentumDelta: 5,
                    feedback: 'Automation in place! Your future-self thanks you.',
                    suggestedAction: 'Set the transfer reminder right now.'
                },
                {
                    label: 'Divert cash-back or reward points',
                    detail: 'Redeem $15 worth of rewards directly into savings.',
                    momentumDelta: 3,
                    feedback: 'Creative rerouting adds sparkle without touching cash flow.',
                    suggestedAction: 'Check your rewards portal tonight.'
                },
                {
                    label: 'Pause contributions for two weeks',
                    detail: 'Regain breathing room and resume later.',
                    momentumDelta: -4,
                    feedback: 'Short pause, but momentum wanes. Have a date to restart.',
                    suggestedAction: 'Set a calendar ping for the restart date.'
                }
            ]
        }),
        investments: () => ({
            title: 'Portfolio Volatility Check',
            prompt: `Markets nudged your potion down ${Math.abs(userData.investmentPerformance - 70)} points. Choose how to steady your investing hand.`,
            microGoal: 'Schedule a 15-min review of allocations this weekend',
            baseMomentum: 10,
            choices: [
                {
                    label: 'Rebalance toward safer ingredients',
                    detail: 'Shift 5% into lower-volatility positions.',
                    momentumDelta: 4,
                    feedback: 'Balance restored. Your potion simmers more evenly.',
                    suggestedAction: 'Log into your brokerage to queue the rebalance.'
                },
                {
                    label: 'Top up with a small buy on the dip',
                    detail: 'Invest $50 into your core fund.',
                    momentumDelta: 6,
                    feedback: 'Buying the dip adds long-term potency.',
                    suggestedAction: 'Set a price alert to time the entry.'
                },
                {
                    label: 'Ride it out without action',
                    detail: 'Let the potion settle naturally.',
                    momentumDelta: 0,
                    feedback: 'Patience is a virtue, but monitor the trend closely.',
                    suggestedAction: 'Note a check-in for next week.'
                }
            ]
        }),
        literacy: () => ({
            title: 'Knowledge Quest Opportunity',
            prompt: `Quiz streak cooled off recently. Refreshing literacy sparks boosts your FinScore resilience.`,
            microGoal: 'Complete one Advanced Quiz path mid-week',
            baseMomentum: 11,
            choices: [
                {
                    label: 'Tackle a new quiz category tonight',
                    detail: 'Spend 10 minutes on the Risk & Reward module.',
                    momentumDelta: 5,
                    feedback: 'Sharp move! Your literacy aura glows brighter.',
                    suggestedAction: 'Queue a reminder for tonight\'s study sprint.'
                },
                {
                    label: 'Review your last incorrect answers',
                    detail: 'Turn misses into mastery.',
                    momentumDelta: 4,
                    feedback: 'Reflection seals knowledge gaps with ease.',
                    suggestedAction: 'Open your quiz history after dinner.'
                },
                {
                    label: 'Wait until the weekend challenge',
                    detail: 'Rejoin the quiz streak later.',
                    momentumDelta: -2,
                    feedback: 'Delay keeps the brew lukewarm. Try to reclaim the streak soon.',
                    suggestedAction: 'Block time on Saturday morning.'
                }
            ]
        })
    };

    const scenarioBuilder = scenarioTemplates[priority.label] || scenarioTemplates.budget;
    const scenario = scenarioBuilder();
    scenario.priority = priority.label;
    scenario.generatedAt = Date.now();
    return scenario;
}

function renderScenario(scenario) {
    const promptEl = document.getElementById('scenarioPrompt');
    const choicesEl = document.getElementById('scenarioChoices');
    const feedbackEl = document.getElementById('scenarioFeedback');
    const momentumEl = document.getElementById('scenarioMomentum');
    const commitBtn = document.getElementById('commitMicroGoalBtn');

    if (!promptEl || !choicesEl || !feedbackEl || !momentumEl || !commitBtn) {
        return;
    }

    promptEl.textContent = scenario.prompt;
    feedbackEl.textContent = 'Pick a move to guide your brew. 🪄';
    feedbackEl.classList.remove('positive', 'neutral', 'negative');
    choicesEl.innerHTML = '';

    scenario.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'coach-choice-btn glassy-button';
        button.innerHTML = `
            <span class="choice-label">${choice.label}</span>
            <small class="choice-detail">${choice.detail}</small>
        `;
        button.addEventListener('click', () => handleScenarioChoice(choice, button));
        if (index === 0) {
            button.setAttribute('data-default', 'true');
        }
        choicesEl.appendChild(button);
    });

    momentumEl.textContent = `${scenario.baseMomentum} pts`;
    momentumEl.dataset.momentum = scenario.baseMomentum;
    commitBtn.disabled = false;
    commitBtn.textContent = 'Commit to Goal';
    commitBtn.dataset.goal = scenario.microGoal || '';
}

function handleScenarioChoice(choice, buttonElement) {
    const feedbackEl = document.getElementById('scenarioFeedback');
    const momentumEl = document.getElementById('scenarioMomentum');
    const commitBtn = document.getElementById('commitMicroGoalBtn');

    if (!feedbackEl || !momentumEl) {
        return;
    }

    document.querySelectorAll('.coach-choice-btn.selected').forEach(btn => btn.classList.remove('selected'));
    if (buttonElement) {
        buttonElement.classList.add('selected');
    }

    const baseMomentum = activeScenario ? activeScenario.baseMomentum : 0;
    const updatedMomentum = baseMomentum + choice.momentumDelta;

    momentumEl.textContent = `${updatedMomentum} pts`;
    momentumEl.dataset.momentum = updatedMomentum;

    feedbackEl.innerHTML = `
        <strong>${choice.feedback}</strong>
        <div class="feedback-detail">${choice.suggestedAction}</div>
    `;
    feedbackEl.classList.remove('positive', 'neutral', 'negative');
    feedbackEl.classList.add(choice.momentumDelta >= 4 ? 'positive' : choice.momentumDelta >= 0 ? 'neutral' : 'negative');

    if (commitBtn) {
        const goalText = choice.suggestedAction || activeScenario.microGoal;
        commitBtn.dataset.goal = activeScenario.microGoal || goalText;
    }
}

function handleCommitMicroGoal() {
    const commitBtn = document.getElementById('commitMicroGoalBtn');
    const feedbackEl = document.getElementById('scenarioFeedback');
    const momentumEl = document.getElementById('scenarioMomentum');

    if (!commitBtn || commitBtn.disabled) {
        return;
    }

    const goalText = commitBtn.dataset.goal;
    if (!goalText) {
        return;
    }

    const momentum = momentumEl ? parseInt(momentumEl.dataset.momentum || '0', 10) : 0;
    committedMicroGoals.unshift({
        label: goalText,
        detail: 'Locked from Smart Coach scenario',
        committedAt: Date.now(),
        momentumGain: momentum
    });

    if (feedbackEl) {
        feedbackEl.classList.remove('neutral', 'negative');
        feedbackEl.classList.add('positive');
        feedbackEl.innerHTML = `<strong>Goal locked!</strong> ${goalText}`;
    }

    commitBtn.disabled = true;
    commitBtn.textContent = 'Added!';

    renderMicroGoals(latestUserData);
}

function renderMicroGoals(userData) {
    const listEl = document.getElementById('microGoalList');
    if (!listEl) return;

    const autoGoals = buildMicroGoals(userData);

    const combinedGoals = committedMicroGoals.concat(autoGoals).slice(0, 4);

    listEl.innerHTML = '';

    combinedGoals.forEach(goal => {
        const item = document.createElement('li');
        item.className = 'micro-goal-item';

        if (goal.committedAt) {
            item.classList.add('committed');
        }

        item.innerHTML = `
            <div class="micro-goal-title">
                ${goal.label}
                ${goal.momentumGain ? `<span class="micro-goal-bonus">+${goal.momentumGain} pts</span>` : ''}
            </div>
            <small class="micro-goal-detail">${goal.detail}</small>
        `;

        listEl.appendChild(item);
        if (typeof window.registerRevealElement === 'function') {
            window.registerRevealElement(item);
        }
    });
}

function buildMicroGoals(userData) {
    if (!userData) return [];

    const goals = [];

    if (userData.budgetAdherence < 75) {
        goals.push({
            label: 'Log every swipe for 3 days',
            detail: 'Quick audit boosts awareness and trims overflow.',
            priority: 'high'
        });
    } else {
        goals.push({
            label: 'Celebrate budget wins',
            detail: 'Share one tip with your team chat to reinforce habits.',
            priority: 'medium'
        });
    }

    if (userData.savingProgress < 70) {
        goals.push({
            label: 'Add an automated top-up',
            detail: 'Set an extra $15 transfer before Friday.',
            priority: 'high'
        });
    } else {
        goals.push({
            label: 'Name your next savings milestone',
            detail: 'Attach a purpose to keep momentum high.',
            priority: 'medium'
        });
    }

    if (userData.quizScore < 65) {
        goals.push({
            label: 'Complete two quiz rematches',
            detail: 'Revisit missed questions to solidify knowledge.',
            priority: 'medium'
        });
    } else {
        goals.push({
            label: 'Unlock a new academy badge',
            detail: 'Advance to the next badge tier this week.',
            priority: 'medium'
        });
    }

    return goals;
}

function updateMonthlyRecap(userData) {
    const recapEl = document.getElementById('monthlyRecapHighlight');
    if (!recapEl || !userData) return;
    
    const baseHighlights = [];

    if (userData.finScore >= 85) {
        baseHighlights.push({
            icon: '✨',
            text: 'FinScore potion is radiant—keep nurturing those habits.'
        });
    } else if (userData.finScore >= 70) {
        baseHighlights.push({
            icon: '🔮',
            text: 'FinScore is steady; one focused push will reach legendary shimmer.'
        });
    } else {
        baseHighlights.push({
            icon: '⚠️',
            text: 'Potion stability dipped; reinforce core rituals this week.'
        });
    }

    baseHighlights.push(
        userData.savingProgress >= 75
            ? { icon: '🏦', text: 'Savings enchantments are working—automation pays off.' }
            : { icon: '💧', text: 'Savings pool wants a refill; consider a mini top-up.' }
    );

    baseHighlights.push(
        userData.budgetAdherence >= 75
            ? { icon: '🧭', text: 'Budget lanes stayed aligned almost every day.' }
            : { icon: '🛠️', text: 'Budget flow wandered; tighten categories before overflow.' }
    );

    const focusArea = determinePriorityArea(userData);
    if (focusArea) {
        baseHighlights.push({
            icon: '🎯',
            text: `This week’s focus: ${focusArea.labelTitle}. ${focusArea.tip}`
        });
    }

    recapEl.innerHTML = `
        <ul class="recap-bullets">
            ${baseHighlights
                .map(highlight => `<li><span class="recap-icon">${highlight.icon}</span>${highlight.text}</li>`)
                .join('')}
        </ul>
    `;
}

function updateNextCheckIn(userData) {
    const chip = document.getElementById('nextCheckIn');
    if (!chip || !userData) return;

    const daysUntilCheck = userData.budgetAdherence < 60 ? 2 : userData.savingProgress < 65 ? 3 : 5;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysUntilCheck);

    chip.textContent = formatCheckInDate(nextDate);
}

function formatCheckInDate(date) {
    return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

function showCategoryBreakdown(categoryName) {
    alert(`Category breakdown for ${categoryName}:\n\nThis feature will show detailed spending analysis for this category.`);
}

function getMockUserProfile(userId) {
    const baseProfile =
        MOCK_USER_PROFILES.find(profile => profile.id === userId) ||
        MOCK_USER_PROFILES[Math.floor(Math.random() * MOCK_USER_PROFILES.length)];

    const variance = {
        budgetAdherence: 9,
        savingProgress: 12,
        investmentPerformance: 15,
        quizScore: 8
    };

    const jitter = (value, range) => {
        const delta = (Math.random() * range * 2) - range;
        return clamp(Math.round(value + delta), 30, 98);
    };

    const snapshot = {
        id: baseProfile.id,
        name: baseProfile.name,
        budgetAdherence: jitter(baseProfile.budgetAdherence, variance.budgetAdherence),
        savingProgress: jitter(baseProfile.savingProgress, variance.savingProgress),
        investmentPerformance: jitter(baseProfile.investmentPerformance, variance.investmentPerformance),
        quizScore: jitter(baseProfile.quizScore, variance.quizScore)
    };

    snapshot.finScore = Number(
        (
            snapshot.budgetAdherence * 0.35 +
            snapshot.savingProgress * 0.3 +
            snapshot.investmentPerformance * 0.2 +
            snapshot.quizScore * 0.15
        ).toFixed(1)
    );

    snapshot.recentWins = [
        'Finished the Streak Saver challenge',
        'Logged every purchase for three days',
        'Shared a budgeting recipe with the Brew Crew'
    ];

    return snapshot;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function surfaceMockBanner(userData) {
    const bannerId = 'mockDataBanner';
    if (document.getElementById(bannerId)) {
        return;
    }

    const container = document.querySelector('.container');
    if (!container) return;

    const banner = document.createElement('div');
    banner.id = bannerId;
    banner.className = 'mock-data-banner';
    banner.innerHTML = `
        <span class="badge rounded-pill bg-info-subtle text-info-emphasis">Demo Mode</span>
        <span>Showing Smart Coach preview for ${userData.name || 'Budget Brewer'} while the live data cauldron warms up.</span>
    `;

    container.insertBefore(banner, container.firstChild);
}

function determinePriorityArea(userData) {
    if (!userData) return null;
    const areas = [
        {
            key: 'budgetAdherence',
            score: userData.budgetAdherence,
            label: 'budget',
            labelTitle: 'budget balance',
            tip: 'Audit two categories where you overspent and note a quick swap.'
        },
        {
            key: 'savingProgress',
            score: userData.savingProgress,
            label: 'savings',
            labelTitle: 'savings momentum',
            tip: 'Route a micro-transfer before Friday to keep the streak glowing.'
        },
        {
            key: 'investmentPerformance',
            score: userData.investmentPerformance,
            label: 'investments',
            labelTitle: 'portfolio calm',
            tip: 'Review asset mix to see if a 3% rebalance could steady things.'
        },
        {
            key: 'quizScore',
            score: userData.quizScore,
            label: 'literacy',
            labelTitle: 'literacy aura',
            tip: 'Revisit one quiz path to reignite your confidence spark.'
        }
    ];

    areas.sort((a, b) => a.score - b.score);
    return areas[0];
}

