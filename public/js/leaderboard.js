// Leaderboard JavaScript

const API_BASE_URL = 'http://localhost:3000/api';

// Load leaderboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
});

async function loadLeaderboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard data');
        }
        
        const users = await response.json();
        displayLeaderboard(users);
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        document.getElementById('loadingMessage').innerHTML = 
            '<p class="text-danger">Failed to load leaderboard. Make sure the server is running.</p>';
    }
}

function displayLeaderboard(users) {
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.style.display = 'none';
    
    const tableBody = document.getElementById('leaderboardTable');
    tableBody.innerHTML = '';
    
    // Display top 3 in cards
    displayTopThree(users.slice(0, 3));
    
    // Display all users in table
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        
        // Add highlight for top 3
        if (index < 3) {
            row.classList.add('table-warning');
        }
        
        row.innerHTML = `
            <td>
                <span class="rank-badge rank-${index + 1}" style="display: ${index < 3 ? 'inline-block' : 'none'}">
                    ${index + 1}
                </span>
                <span style="margin-left: ${index < 3 ? '0' : '0'}">${index + 1}</span>
            </td>
            <td><strong>${user.name}</strong></td>
            <td><strong>${user.finScore.toFixed(2)}</strong></td>
            <td>${user.budgetAdherence}%</td>
            <td>${user.savingProgress}%</td>
            <td>${user.investmentPerformance}%</td>
            <td>${user.quizScore}%</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="sendPotionTo('${user.name}')" title="Send Potion"><span style="color: #f093fb; font-size: 1.2em;">✨</span></button>
                <button class="btn btn-sm btn-outline-success" onclick="cheerUser('${user.name}')" title="Cheer"><span style="color: #4facfe; font-size: 1.2em;">👏</span></button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function displayTopThree(topUsers) {
    const topThreeContainer = document.getElementById('topThreeCards');
    topThreeContainer.innerHTML = '';
    
    const medals = ['🥇', '🥈', '🥉'];
    const rankClasses = ['rank-1', 'rank-2', 'rank-3'];
    
    topUsers.forEach((user, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        
        col.innerHTML = `
            <div class="card top-three-card text-center">
                <div class="card-body">
                    <div class="mb-3" style="font-size: 3rem;">${medals[index]}</div>
                    <h3 class="card-title">${user.name}</h3>
                    <div class="mt-3">
                        <div class="score-display">
                            <span class="score-number">${user.finScore.toFixed(2)}</span>
                            <span class="score-label">/ 100</span>
                        </div>
                    </div>
                    <div class="mt-3">
                        <small class="text-muted">
                            Budget: ${user.budgetAdherence}% | 
                            Savings: ${user.savingProgress}% | 
                            Investments: ${user.investmentPerformance}% | 
                            Quiz: ${user.quizScore}%
                        </small>
                    </div>
                </div>
            </div>
        `;
        
        topThreeContainer.appendChild(col);
    });
}

function sendPotionTo(userName) {
    alert(`Send a potion to ${userName}!\n\nThis feature allows you to send temporary buffs to help your friends improve their financial scores.`);
}

function cheerUser(userName) {
    alert(`👏 Cheering for ${userName}!\n\nKeep up the great work on your financial journey!`);
}

