const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initializeFirebase, optionalAuth, getOrCreateUser } = require('./firebase-auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin SDK
initializeFirebase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Helper function to read data
function getData() {
    try {
        const dataPath = path.join(__dirname, 'data.json');
        if (!fs.existsSync(dataPath)) {
            console.error('Error: data.json file not found!');
            throw new Error('data.json not found');
        }
        const rawData = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error reading data.json:', error.message);
        throw error;
    }
}

// Helper function to save data
function saveData(data) {
    const dataPath = path.join(__dirname, 'data.json');
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
}

// Helper function to calculate FinScore
function calculateFinScore(budgetAdherence, savingProgress, investmentPerformance, quizScore) {
    return (
        budgetAdherence * 0.3 +
        savingProgress * 0.3 +
        investmentPerformance * 0.2 +
        quizScore * 0.2
    );
}

// Helper function to award ingredients based on activity
function awardIngredientsForActivity(activityType, score) {
    const awards = {
        quiz: {
            knowledge: Math.floor(score / 20), // 1 per 20 points
            savings: score >= 80 ? 2 : score >= 60 ? 1 : 0
        },
        budget: {
            budget: score >= 80 ? 3 : score >= 60 ? 2 : 1,
            savings: score >= 80 ? 1 : 0
        },
        savings: {
            savings: score >= 80 ? 3 : score >= 60 ? 2 : 1
        },
        investment: {
            investment: score >= 80 ? 3 : score >= 60 ? 2 : 1
        }
    };
    
    return awards[activityType] || {};
}

// ==================== API ENDPOINTS ====================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running', timestamp: Date.now() });
});

// Get current user data (authenticated)
app.get('/api/user/me', optionalAuth, async (req, res) => {
    try {
        const data = getData();
        let user;
        
        // If Firebase is initialized, get user by Firebase UID
        if (req.userEmail) {
            user = data.users.find(u => u.firebaseUid === req.userId);
            
            // Create user if doesn't exist
            if (!user) {
                user = await getOrCreateUser(req.userId, req.userEmail);
            }
        } else {
            // Fallback to ID-based lookup
            user = data.users.find(u => u.id === req.userId || u.id === req.params.id);
        }
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Calculate FinScore
        const finScore = calculateFinScore(
            user.budgetAdherence,
            user.savingProgress,
            user.investmentPerformance,
            user.quizScore
        );
        
        res.json({
            ...user,
            finScore: Math.round(finScore * 100) / 100
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user data by ID (for backward compatibility)
app.get('/api/user/:id', optionalAuth, (req, res) => {
    try {
        const data = getData();
        const userId = req.params.id === 'me' ? req.userId : req.params.id;
        const user = data.users.find(u => u.id === userId || u.firebaseUid === userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Calculate FinScore
        const finScore = calculateFinScore(
            user.budgetAdherence,
            user.savingProgress,
            user.investmentPerformance,
            user.quizScore
        );
        
        res.json({
            ...user,
            finScore: Math.round(finScore * 100) / 100
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all users (for leaderboard)
app.get('/api/users', (req, res) => {
    try {
        const data = getData();
        const usersWithFinScore = data.users.map(user => ({
            ...user,
            finScore: calculateFinScore(
                user.budgetAdherence,
                user.savingProgress,
                user.investmentPerformance,
                user.quizScore
            )
        }));
        
        // Sort by FinScore descending
        usersWithFinScore.sort((a, b) => b.finScore - a.finScore);
        
        res.json(usersWithFinScore);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get quiz questions
app.get('/api/quiz', (req, res) => {
    try {
        const data = getData();
        res.json(data.quizQuestions);
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Submit quiz results
app.post('/api/quiz/submit', optionalAuth, async (req, res) => {
    try {
        const { answers } = req.body;
        const userId = req.userId || req.body.userId;
        const data = getData();
        
        let user;
        if (req.userEmail) {
            // Firebase authenticated
            user = data.users.find(u => u.firebaseUid === userId);
            if (!user) {
                user = await getOrCreateUser(userId, req.userEmail);
            }
        } else {
            // Fallback to ID lookup
            user = data.users.find(u => u.id === userId);
        }
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Calculate score
        const questions = data.quizQuestions;
        let correctAnswers = 0;
        
        questions.forEach(question => {
            if (answers[question.id] === question.correct) {
                correctAnswers++;
            }
        });
        
        const score = Math.round((correctAnswers / questions.length) * 100);
        
        // Update user quiz score
        user.quizScore = score;
        
        // Award ingredients based on quiz performance
        const ingredientAwards = awardIngredientsForActivity('quiz', score);
        Object.keys(ingredientAwards).forEach(type => {
            if (!user.ingredients[type]) user.ingredients[type] = 0;
            user.ingredients[type] += ingredientAwards[type];
        });
        
        // Record activity
        user.activities.push({
            type: 'quiz',
            score: score,
            timestamp: Date.now(),
            ingredientsAwarded: ingredientAwards
        });
        
        // Recalculate FinScore
        const finScore = calculateFinScore(
            user.budgetAdherence,
            user.savingProgress,
            user.investmentPerformance,
            user.quizScore
        );
        
        saveData(data);
        
        res.json({
            score: score,
            finScore: Math.round(finScore * 100) / 100,
            ingredientsAwarded: ingredientAwards,
            ingredients: user.ingredients
        });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user ingredients
app.get('/api/user/:id/ingredients', (req, res) => {
    try {
        const data = getData();
        const user = data.users.find(u => u.id === req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user.ingredients || {
            savings: 0,
            budget: 0,
            knowledge: 0,
            investment: 0
        });
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user ingredients (for manual updates or activity rewards)
app.post('/api/user/:id/ingredients', (req, res) => {
    try {
        const { ingredients } = req.body;
        const data = getData();
        const user = data.users.find(u => u.id === req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update ingredients
        Object.keys(ingredients).forEach(type => {
            if (user.ingredients[type] !== undefined) {
                user.ingredients[type] = Math.max(0, ingredients[type]);
            }
        });
        
        saveData(data);
        
        res.json(user.ingredients);
    } catch (error) {
        console.error('Error updating ingredients:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Record activity and award ingredients
app.post('/api/user/:id/activity', (req, res) => {
    try {
        const { activityType, score } = req.body;
        const data = getData();
        const user = data.users.find(u => u.id === req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Award ingredients based on activity
        const ingredientAwards = awardIngredientsForActivity(activityType, score);
        Object.keys(ingredientAwards).forEach(type => {
            if (!user.ingredients[type]) user.ingredients[type] = 0;
            user.ingredients[type] += ingredientAwards[type];
        });
        
        // Record activity
        user.activities.push({
            type: activityType,
            score: score,
            timestamp: Date.now(),
            ingredientsAwarded: ingredientAwards
        });
        
        saveData(data);
        
        res.json({
            ingredients: user.ingredients,
            ingredientsAwarded: ingredientAwards
        });
    } catch (error) {
        console.error('Error recording activity:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get active potions for user
app.get('/api/user/:id/potions', (req, res) => {
    try {
        const data = getData();
        const user = data.users.find(u => u.id === req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Filter out expired potions
        const now = Date.now();
        user.activePotions = (user.activePotions || []).filter(potion => potion.expiresAt > now);
        
        saveData(data);
        
        res.json(user.activePotions || []);
    } catch (error) {
        console.error('Error fetching potions:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Brew a potion
app.post('/api/user/:id/potions/brew', (req, res) => {
    try {
        const { potionType } = req.body;
        const data = getData();
        const user = data.users.find(u => u.id === req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Potion recipes
        const potionRecipes = {
            challenge: {
                name: 'Challenge Potion',
                icon: '🛡',
                requirements: { savings: 3, budget: 2 },
                effect: 'Reduces penalties and improves budget adherence',
                duration: 7
            },
            savings: {
                name: 'Savings Elixir',
                icon: '💎',
                requirements: { savings: 5, investment: 2 },
                effect: 'Boosts score multipliers and accelerates savings',
                duration: 14
            },
            subscription: {
                name: 'Subscription Dissolver',
                icon: '🧹',
                requirements: { budget: 4, knowledge: 2 },
                effect: 'AI suggests unused subscriptions to cancel',
                duration: 30
            },
            knowledge: {
                name: 'Knowledge Boost',
                icon: '🧠',
                requirements: { knowledge: 5, savings: 2 },
                effect: 'Unlocks advanced financial literacy modules',
                duration: 30
            },
            investment: {
                name: 'Investment Catalyst',
                icon: '📈',
                requirements: { investment: 4, knowledge: 3 },
                effect: 'Enhances investment performance insights',
                duration: 14
            },
            budget: {
                name: 'Budget Stabilizer',
                icon: '⚖',
                requirements: { budget: 5, savings: 3 },
                effect: 'Maintains consistent budget adherence',
                duration: 7
            }
        };
        
        const recipe = potionRecipes[potionType];
        if (!recipe) {
            return res.status(400).json({ error: 'Invalid potion type' });
        }
        
        // Check if user has required ingredients
        for (const [ingredient, amount] of Object.entries(recipe.requirements)) {
            if ((user.ingredients[ingredient] || 0) < amount) {
                return res.status(400).json({ 
                    error: `Not enough ${ingredient} ingredients`,
                    required: amount,
                    have: user.ingredients[ingredient] || 0
                });
            }
        }
        
        // Consume ingredients
        for (const [ingredient, amount] of Object.entries(recipe.requirements)) {
            user.ingredients[ingredient] -= amount;
        }
        
        // Create potion
        const potion = {
            type: potionType,
            name: recipe.name,
            icon: recipe.icon,
            effect: recipe.effect,
            brewedAt: Date.now(),
            expiresAt: Date.now() + (recipe.duration * 24 * 60 * 60 * 1000)
        };
        
        if (!user.activePotions) user.activePotions = [];
        user.activePotions.push(potion);
        
        saveData(data);
        
        res.json({
            success: true,
            potion: potion,
            ingredients: user.ingredients
        });
    } catch (error) {
        console.error('Error brewing potion:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user metrics (for budget, savings, investment updates)
app.put('/api/user/:id/metrics', (req, res) => {
    try {
        const { budgetAdherence, savingProgress, investmentPerformance } = req.body;
        const data = getData();
        const user = data.users.find(u => u.id === req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update metrics if provided
        if (budgetAdherence !== undefined) {
            user.budgetAdherence = Math.max(0, Math.min(100, budgetAdherence));
            
            // Award ingredients for good budget adherence
            if (budgetAdherence >= 80) {
                const awards = awardIngredientsForActivity('budget', budgetAdherence);
                Object.keys(awards).forEach(type => {
                    if (!user.ingredients[type]) user.ingredients[type] = 0;
                    user.ingredients[type] += awards[type];
                });
            }
        }
        
        if (savingProgress !== undefined) {
            user.savingProgress = Math.max(0, Math.min(100, savingProgress));
            
            // Award ingredients for good savings progress
            if (savingProgress >= 70) {
                const awards = awardIngredientsForActivity('savings', savingProgress);
                Object.keys(awards).forEach(type => {
                    if (!user.ingredients[type]) user.ingredients[type] = 0;
                    user.ingredients[type] += awards[type];
                });
            }
        }
        
        if (investmentPerformance !== undefined) {
            user.investmentPerformance = Math.max(0, Math.min(100, investmentPerformance));
            
            // Award ingredients for good investment performance
            if (investmentPerformance >= 70) {
                const awards = awardIngredientsForActivity('investment', investmentPerformance);
                Object.keys(awards).forEach(type => {
                    if (!user.ingredients[type]) user.ingredients[type] = 0;
                    user.ingredients[type] += awards[type];
                });
            }
        }
        
        // Recalculate FinScore
        const finScore = calculateFinScore(
            user.budgetAdherence,
            user.savingProgress,
            user.investmentPerformance,
            user.quizScore
        );
        
        saveData(data);
        
        res.json({
            ...user,
            finScore: Math.round(finScore * 100) / 100
        });
    } catch (error) {
        console.error('Error updating metrics:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
// ==================== Team Management Endpoints ====================

// Get all teams
app.get('/api/teams', (req, res) => {
    try {
        const data = getData();
        const teams = (data.teams || []).map(team => {
            // Calculate average score for team
            const members = data.users.filter(u => u.teamId === team.id);
            const totalScore = members.reduce((sum, u) => sum + (u.finScore || 0), 0);
            const averageScore = members.length > 0 ? totalScore / members.length : 0;
            
            return {
                id: team.id,
                name: team.name,
                code: team.code,
                averageScore: averageScore,
                memberCount: members.length
            };
        });
        
        // Sort by average score
        teams.sort((a, b) => b.averageScore - a.averageScore);
        res.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new team
app.post('/api/teams', (req, res) => {
    try {
        const { name, userId } = req.body;
        if (!name || !userId) {
            return res.status(400).json({ error: 'Team name and user ID required' });
        }
        
        const data = getData();
        if (!data.teams) data.teams = [];
        
        // Generate unique team code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const newTeam = {
            id: (data.teams.length + 1).toString(),
            name: name,
            code: code,
            createdAt: Date.now()
        };
        
        data.teams.push(newTeam);
        
        // Add user to team
        const user = data.users.find(u => u.id === userId || u.firebaseUid === userId);
        if (user) {
            user.teamId = newTeam.id;
            user.teamName = newTeam.name;
        }
        
        saveData(data);
        res.json(newTeam);
    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Join a team
app.post('/api/teams/join', (req, res) => {
    try {
        const { code, userId } = req.body;
        if (!code || !userId) {
            return res.status(400).json({ error: 'Team code and user ID required' });
        }
        
        const data = getData();
        if (!data.teams) data.teams = [];
        
        const team = data.teams.find(t => t.code === code.toUpperCase());
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        
        // Add user to team
        const user = data.users.find(u => u.id === userId || u.firebaseUid === userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.teamId = team.id;
        user.teamName = team.name;
        
        saveData(data);
        res.json({ success: true, team: team });
    } catch (error) {
        console.error('Error joining team:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Leave a team
app.post('/api/teams/leave', (req, res) => {
    try {
        const { userId, teamId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }
        
        const data = getData();
        const user = data.users.find(u => u.id === userId || u.firebaseUid === userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.teamId = undefined;
        user.teamName = undefined;
        
        saveData(data);
        res.json({ success: true });
    } catch (error) {
        console.error('Error leaving team:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's team
app.get('/api/user/:id/team', (req, res) => {
    try {
        const data = getData();
        const user = data.users.find(u => u.id === req.params.id || u.firebaseUid === req.params.id);
        
        if (!user || !user.teamId) {
            return res.json({ team: null });
        }
        
        const team = (data.teams || []).find(t => t.id === user.teamId);
        if (!team) {
            return res.json({ team: null });
        }
        
        // Calculate average score
        const members = data.users.filter(u => u.teamId === team.id);
        const totalScore = members.reduce((sum, u) => sum + (u.finScore || 0), 0);
        const averageScore = members.length > 0 ? totalScore / members.length : 0;
        
        res.json({
            team: {
                ...team,
                averageScore: averageScore,
                members: members.map(u => ({ id: u.id, name: u.name || u.email }))
            }
        });
    } catch (error) {
        console.error('Error fetching user team:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update users endpoint to include team info
app.get('/api/users', (req, res) => {
    try {
        const data = getData();
        const users = data.users.map(user => {
            const finScore = calculateFinScore(
                user.budgetAdherence || 0,
                user.savingProgress || 0,
                user.investmentPerformance || 0,
                user.quizScore || 0
            );
            
            return {
                ...user,
                finScore: finScore,
                teamName: user.teamName || null
            };
        });
        
        // Sort by FinScore (descending)
        users.sort((a, b) => b.finScore - a.finScore);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`BudgetBrew server running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

