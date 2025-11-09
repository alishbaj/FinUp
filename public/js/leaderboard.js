// Leaderboard JavaScript

const MOCK_LEADERBOARD = [
    {
        id: 'avery',
        name: 'Avery Starling',
        emoji: '🪄',
        team: 'Luminous Ledger',
        finScore: 94.6,
        budgetAdherence: 92,
        savingProgress: 89,
        investmentPerformance: 78,
        quizScore: 97,
        streak: 12,
        weeklyDelta: 3.8,
        vibe: 'Crushed the dining-out challenge this week'
    },
    {
        id: 'kai',
        name: 'Kai Rivera',
        emoji: '🧭',
        team: 'Vault Voyagers',
        finScore: 91.2,
        budgetAdherence: 88,
        savingProgress: 93,
        investmentPerformance: 74,
        quizScore: 90,
        streak: 15,
        weeklyDelta: 2.1,
        vibe: 'Boosted savings with an automated top-up'
    },
    {
        id: 'maya',
        name: 'Maya Chen',
        emoji: '🧪',
        team: 'Potion Planners',
        finScore: 89.5,
        budgetAdherence: 85,
        savingProgress: 82,
        investmentPerformance: 80,
        quizScore: 94,
        streak: 10,
        weeklyDelta: 1.4,
        vibe: 'Mastered a new investing badge in the academy'
    },
    {
        id: 'you',
        name: 'You',
        emoji: '🫧',
        team: 'Brew Crew',
        finScore: 87.3,
        budgetAdherence: 84,
        savingProgress: 76,
        investmentPerformance: 68,
        quizScore: 88,
        streak: 6,
        weeklyDelta: 1.7,
        vibe: 'Locked in a micro-goal with Smart Coach',
        isCurrentUser: true
    },
    {
        id: 'elio',
        name: 'Elio Park',
        emoji: '🪙',
        team: 'Luminous Ledger',
        finScore: 84.9,
        budgetAdherence: 79,
        savingProgress: 74,
        investmentPerformance: 70,
        quizScore: 82,
        streak: 4,
        weeklyDelta: -0.5,
        vibe: 'Rebalancing portfolio after a volatile week'
    },
    {
        id: 'sasha',
        name: 'Sasha Quinn',
        emoji: '🧿',
        team: 'Vault Voyagers',
        finScore: 83.1,
        budgetAdherence: 81,
        savingProgress: 71,
        investmentPerformance: 64,
        quizScore: 86,
        streak: 3,
        weeklyDelta: 0.8,
        vibe: 'Trimmed impulse buys to protect the budget'
    },
    {
        id: 'priya',
        name: 'Priya Das',
        emoji: '🌟',
        team: 'Potion Planners',
        finScore: 80.4,
        budgetAdherence: 76,
        savingProgress: 69,
        investmentPerformance: 60,
        quizScore: 91,
        streak: 2,
        weeklyDelta: -1.2,
        vibe: 'Studying for the platinum literacy badge'
    }
];

const LEADERBOARD_LOAD_DELAY = 620;

document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
});

function loadLeaderboard() {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.style.display = 'block';
    }

    setTimeout(() => {
        const users = getMockLeaderboardData();
        displayLeaderboard(users);
    }, LEADERBOARD_LOAD_DELAY);
}

function getMockLeaderboardData() {
    return [...MOCK_LEADERBOARD]
        .sort((a, b) => b.finScore - a.finScore)
        .map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));
}

function displayLeaderboard(users) {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.style.display = 'none';
    }

    displayTopThree(users.slice(0, 3));

    const tableBody = document.getElementById('leaderboardTable');
    if (!tableBody) {
        return;
    }
    tableBody.innerHTML = '';

    users.forEach((user) => {
        const row = document.createElement('tr');
        row.classList.add('leaderboard-row');
        if (user.rank <= 3) {
            row.classList.add('leaderboard-row-elite');
        }
        if (user.isCurrentUser) {
            row.classList.add('leaderboard-row-current');
        }

        row.innerHTML = `
            <td class="leaderboard-rank-cell">
                ${user.rank <= 3
                    ? `<span class="rank-badge rank-${user.rank}">${user.rank}</span>`
                    : `<span class="rank-number">${user.rank}</span>`}
            </td>
            <td>
                <div class="leaderboard-name-cell">
                    <span class="leaderboard-avatar" aria-hidden="true">${user.emoji || '🧙'}</span>
                    <div class="leaderboard-name-stack">
                        <div class="leaderboard-name-line">
                            <strong>${user.name}</strong>
                            ${user.isCurrentUser ? '<span class="you-chip">You</span>' : ''}
                        </div>
                        <div class="leaderboard-meta-row">
                            <span class="leaderboard-team-chip">${user.team}</span>
                            <span class="leaderboard-streak-chip">🔥 ${user.streak}-day streak</span>
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <div class="stat-value">${user.finScore.toFixed(1)}</div>
                <div class="stat-delta ${getDeltaClass(user.weeklyDelta)}">${formatDelta(user.weeklyDelta)}</div>
            </td>
            <td>
                <div class="leaderboard-vibe">${user.vibe}</div>
            </td>
            <td class="leaderboard-actions">
                <button class="btn btn-sm btn-outline-primary glassy-button" onclick="sendPotionTo('${user.name}')" title="Send Potion"><span style="color: #f093fb; font-size: 1.2em;">✨</span></button>
                <button class="btn btn-sm btn-outline-success glassy-button" onclick="cheerUser('${user.name}')" title="Cheer"><span style="color: #4facfe; font-size: 1.2em;">👏</span></button>
            </td>
        `;

        tableBody.appendChild(row);
        if (typeof window.registerRevealElement === 'function') {
            window.registerRevealElement(row);
        }
    });

    if (typeof window.refreshScrollReveal === 'function') {
        window.refreshScrollReveal();
    }
}

function displayTopThree(topUsers) {
    const topThreeContainer = document.getElementById('topThreeCards');
    if (!topThreeContainer) return;

    topThreeContainer.innerHTML = '';
    const medals = ['🥇', '🥈', '🥉'];

    topUsers.forEach((user, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';

        col.innerHTML = `
            <div class="card top-three-card text-center">
                <div class="card-body">
                    <div class="leaderboard-medal">${medals[index]}</div>
                    <h3 class="card-title">${user.name}</h3>
                    <div class="leaderboard-card-meta">
                        <span class="leaderboard-team-chip">${user.team}</span>
                        <span class="leaderboard-streak-chip">🔥 ${user.streak}-day streak</span>
                        <span class="stat-delta ${getDeltaClass(user.weeklyDelta)}">${formatDelta(user.weeklyDelta)}</span>
                    </div>
                    <div class="leaderboard-card-score">
                        <span class="score-number">${user.finScore.toFixed(1)}</span>
                        <span class="score-label">FinScore</span>
                    </div>
                    <p class="leaderboard-card-note">${user.vibe}</p>
                </div>
            </div>
        `;

        topThreeContainer.appendChild(col);

        if (typeof window.registerRevealElement === 'function') {
            const card = col.querySelector('.top-three-card');
            if (card) {
                window.registerRevealElement(card);
            }
        }
    });
}

function sendPotionTo(userName) {
    alert(`✨ You send a supportive brew to ${userName}!\n\nThey get a momentum boost on their next goal check-in.`);
}

function cheerUser(userName) {
    alert(`👏 ${userName} hears your cheer across the tavern!\n\nKeep stacking streaks together.`);
}

function formatDelta(delta) {
    if (delta === undefined || delta === null) return '--';
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(1)} pts`;
}

function getDeltaClass(delta) {
    if (delta > 0.5) return 'positive';
    if (delta < -0.5) return 'negative';
    return 'neutral';
}

