// Leaderboard JavaScript

const API_BASE_URL = 'http://localhost:3000/api';
let currentUserId = null;
let userTeam = null;

// Load leaderboard when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await loadCurrentUserId();
    await loadUserTeam();
    loadLeaderboard();
    loadTeamRankings();
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

// Get current user ID
async function loadCurrentUserId() {
    try {
        if (typeof getCurrentUser === 'function') {
            const user = getCurrentUser();
            if (user) {
                if (typeof authenticatedFetch === 'function') {
                    try {
                        const response = await authenticatedFetch(`${API_BASE_URL}/user/me`);
                        if (response && response.ok) {
                            const userData = await response.json();
                            currentUserId = userData.id || userData.firebaseUid || null;
                            return;
                        }
                    } catch (error) {
                        console.warn('Could not fetch user data:', error);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error loading user ID:', error);
    }
}

// Load user's team
async function loadUserTeam() {
    if (!currentUserId) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/user/${currentUserId}/team`);
        if (response.ok) {
            const teamData = await response.json();
            if (teamData.team) {
                userTeam = teamData.team;
                displayTeamInfo(teamData.team);
            }
        }
    } catch (error) {
        console.error('Error loading team:', error);
    }
}

// Display team info
function displayTeamInfo(team) {
    document.getElementById('teamSection').style.display = 'none';
    document.getElementById('myTeamInfo').style.display = 'block';
    document.getElementById('teamName').textContent = team.name;
    document.getElementById('teamScore').textContent = team.averageScore ? team.averageScore.toFixed(2) : 'N/A';
    document.getElementById('teamMembers').textContent = team.members ? team.members.length : 0;
}

function displayLeaderboard(users) {
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.style.display = 'none';
    
    const tableBody = document.getElementById('leaderboardTable');
    tableBody.innerHTML = '';
    
    // Display top 3 in cards (only show budget score)
    displayTopThree(users.slice(0, 3));
    
    // Display all users in table (hide personal info, show only budget score)
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        
        // Add highlight for top 3
        if (index < 3) {
            row.classList.add('table-warning');
        }
        
        // Generate username from email or use anonymized name
        const username = user.email ? user.email.split('@')[0] : `User${user.id}`;
        const teamName = user.teamName || 'No Team';
        
        row.innerHTML = `
            <td>
                <span class="rank-badge rank-${index + 1}" style="display: ${index < 3 ? 'inline-block' : 'none'}">
                    ${index + 1}
                </span>
                <span style="margin-left: ${index < 3 ? '0' : '0'}">${index + 1}</span>
            </td>
            <td><strong>${username}</strong></td>
            <td><strong>${user.finScore.toFixed(2)}</strong></td>
            <td>${teamName}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function displayTopThree(topUsers) {
    const topThreeContainer = document.getElementById('topThreeCards');
    topThreeContainer.innerHTML = '';
    
    const medals = ['🥇', '🥈', '🥉'];
    
    topUsers.forEach((user, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        
        // Generate username from email or use anonymized name
        const username = user.email ? user.email.split('@')[0] : `User${user.id}`;
        const teamName = user.teamName || 'No Team';
        
        col.innerHTML = `
            <div class="card top-three-card text-center">
                <div class="card-body">
                    <div class="mb-3" style="font-size: 3rem;">${medals[index]}</div>
                    <h3 class="card-title">${username}</h3>
                    <div class="mt-3">
                        <div class="score-display">
                            <span class="score-number">${user.finScore.toFixed(2)}</span>
                            <span class="score-label">/ 100</span>
                        </div>
                    </div>
                    <div class="mt-3">
                        <small class="text-muted">
                            Team: ${teamName}
                        </small>
                    </div>
                </div>
            </div>
        `;
        
        topThreeContainer.appendChild(col);
    });
}

// Team management functions
function showCreateTeamModal() {
    const teamName = prompt('Enter team name:');
    if (teamName && teamName.trim()) {
        createTeam(teamName.trim());
    }
}

function showJoinTeamModal() {
    const teamCode = prompt('Enter team code to join:');
    if (teamCode && teamCode.trim()) {
        joinTeam(teamCode.trim());
    }
}

async function createTeam(teamName) {
    if (!currentUserId) {
        alert('Please log in to create a team');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/teams`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: teamName,
                userId: currentUserId
            })
        });
        
        if (response.ok) {
            const team = await response.json();
            alert(`Team "${teamName}" created! Team code: ${team.code}`);
            location.reload();
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to create team');
        }
    } catch (error) {
        console.error('Error creating team:', error);
        alert('Failed to create team');
    }
}

async function joinTeam(teamCode) {
    if (!currentUserId) {
        alert('Please log in to join a team');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/teams/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: teamCode,
                userId: currentUserId
            })
        });
        
        if (response.ok) {
            alert('Successfully joined team!');
            location.reload();
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to join team');
        }
    } catch (error) {
        console.error('Error joining team:', error);
        alert('Failed to join team');
    }
}

async function leaveTeam() {
    if (!currentUserId || !userTeam) return;
    
    if (confirm('Are you sure you want to leave your team?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/teams/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUserId,
                    teamId: userTeam.id
                })
            });
            
            if (response.ok) {
                alert('Left team successfully');
                location.reload();
            } else {
                alert('Failed to leave team');
            }
        } catch (error) {
            console.error('Error leaving team:', error);
            alert('Failed to leave team');
        }
    }
}

async function loadTeamRankings() {
    try {
        const response = await fetch(`${API_BASE_URL}/teams`);
        if (response.ok) {
            const teams = await response.json();
            displayTeamRankings(teams);
        }
    } catch (error) {
        console.error('Error loading team rankings:', error);
    }
}

function displayTeamRankings(teams) {
    const tableBody = document.getElementById('teamsTable');
    tableBody.innerHTML = '';
    
    // Sort teams by average score
    teams.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
    
    teams.forEach((team, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${team.name}</strong></td>
            <td><strong>${(team.averageScore || 0).toFixed(2)}</strong></td>
            <td>${team.memberCount || 0}</td>
        `;
        tableBody.appendChild(row);
    });
}

function sendPotionTo(userName) {
    alert(`Send a potion to ${userName}!\n\nThis feature allows you to send temporary buffs to help your friends improve their financial scores.`);
}

function cheerUser(userName) {
    alert(`👏 Cheering for ${userName}!\n\nKeep up the great work on your financial journey!`);
}

