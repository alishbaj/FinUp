// Ingredients (Transactions) JavaScript

// API_BASE_URL is declared in firebase.js (which loads first)
// Don't redeclare it - just use the existing one
// If for some reason it doesn't exist, we'll use window.API_BASE_URL or default

let transactions = [];
let currentUserId = null;

const categoryIcons = {
    food: '<span style="color: #f093fb; font-size: 1.2em;">◉</span>',
    transport: '<span style="color: #667eea; font-size: 1.2em;">◐</span>',
    entertainment: '<span style="color: #764ba2; font-size: 1.2em;">◊</span>',
    shopping: '<span style="color: #4facfe; font-size: 1.2em;">◈</span>',
    bills: '<span style="color: #00f2fe; font-size: 1.2em;">◑</span>',
    health: '<span style="color: #a78bfa; font-size: 1.2em;">◉</span>',
    other: '<span style="color: #c7c7c7; font-size: 1.2em;">●</span>'
};

const categoryColors = {
    food: '#f093fb',
    transport: '#667eea',
    entertainment: '#764ba2',
    shopping: '#4facfe',
    bills: '#00f2fe',
    health: '#a78bfa',
    other: '#c7c7c7'
};

document.addEventListener('DOMContentLoaded', async () => {
    // Get current user ID
    await loadCurrentUserId();
    
    loadTransactions();
    
    document.getElementById('expenseForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addExpense();
    });
    
    // Auto-analyze description on input
    document.getElementById('expenseDescription').addEventListener('blur', () => {
        const description = document.getElementById('expenseDescription').value;
        if (description) {
            analyzeWithAI(description);
        }
    });
});

// Get current user ID from Firebase or use default
async function loadCurrentUserId() {
    try {
        // Try to get authenticated user
        if (typeof getCurrentUser === 'function') {
            const user = getCurrentUser();
            if (user) {
                // Get user data from backend to get the user ID
                if (typeof authenticatedFetch === 'function') {
                    try {
                        const response = await authenticatedFetch(`${API_BASE_URL}/user/me`);
                        if (response && response.ok) {
                            const userData = await response.json();
                            currentUserId = userData.id || userData.firebaseUid || '1';
                            return;
                        }
                    } catch (fetchError) {
                        console.warn('Could not fetch user data:', fetchError);
                    }
                }
            }
        }
        
        // Fallback to default user
        currentUserId = '1';
    } catch (error) {
        console.error('Error loading user ID:', error);
        currentUserId = '1'; // Fallback
    }
}

async function addExpense() {
    try {
        const amountInput = document.getElementById('expenseAmount');
        const descriptionInput = document.getElementById('expenseDescription');
        const categoryInput = document.getElementById('expenseCategory');
        const impulseInput = document.getElementById('isImpulseBuy');
        
        if (!amountInput || !descriptionInput) {
            console.error('Form elements not found');
            alert('Error: Form not loaded properly. Please refresh the page.');
            return;
        }
        
        const amount = parseFloat(amountInput.value);
        const description = descriptionInput.value.trim();
        const category = categoryInput ? (categoryInput.value || 'other') : 'other';
        const isImpulse = impulseInput ? impulseInput.checked : false;
        
        // Validate input
        if (!amount || amount <= 0 || isNaN(amount)) {
            alert('Please enter a valid amount');
            return;
        }
        
        if (!description || description === '') {
            alert('Please enter a description');
            return;
        }
        
        const transaction = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            description: description,
            category: category,
            amount: amount,
            isImpulse: isImpulse
        };
        
        console.log('Adding transaction:', transaction);
        
        // Initialize transactions array if needed
        if (!Array.isArray(transactions)) {
            transactions = [];
        }
        
        // Add transaction immediately (don't wait for backend)
        transactions.unshift(transaction);
        console.log('Transactions after add:', transactions.length);
        
        // Save and display
        saveTransactions();
        displayTransactions();
        displayIngredientShelf();
        
        // Reset form
        document.getElementById('expenseForm').reset();
        
        // Show sparkle animation if impulse buy
        if (isImpulse) {
            showImpulseSparkle();
        }
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'alert alert-success mt-2';
        successMsg.innerHTML = `<span style="color: #4facfe;">✨</span> Expense added successfully!`;
        document.getElementById('expenseForm').appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
        
        // Update budget metrics on backend (don't block UI)
        updateBudgetMetrics().catch(error => {
            console.error('Error updating metrics (non-blocking):', error);
        });
    } catch (error) {
        console.error('Error in addExpense:', error);
        alert('An error occurred while adding the expense. Please check the console for details.');
    }
}

// Calculate budget metrics from transactions and update backend
async function updateBudgetMetrics() {
    try {
        if (!currentUserId) {
            await loadCurrentUserId();
        }
        
        if (!currentUserId) {
            console.warn('No user ID available, skipping metric update');
            return;
        }
        
        // Calculate budget adherence from transactions
        // Simple calculation: if total spending is within budget, adherence is high
        const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
        const monthlyBudget = 2000; // Default monthly budget (can be made configurable)
        const budgetUsed = (totalSpending / monthlyBudget) * 100;
        
        // Budget adherence: 100% if spending is under budget, decreases as spending increases
        // If spending is 50% of budget, adherence is 50%
        // If spending is 100% of budget, adherence is 0%
        // If spending is over budget, adherence goes negative (we'll cap at 0)
        let budgetAdherence = Math.max(0, 100 - budgetUsed);
        
        // If no transactions, set to 100% (perfect adherence)
        if (transactions.length === 0) {
            budgetAdherence = 100;
        }
        
        // Calculate savings progress (simplified: based on impulse buys)
        // More impulse buys = lower savings progress
        const impulseCount = transactions.filter(t => t.isImpulse).length;
        const totalCount = transactions.length;
        const impulseRatio = totalCount > 0 ? (impulseCount / totalCount) : 0;
        // Savings progress: 100% if no impulse buys, decreases with more impulse buys
        let savingProgress = Math.max(0, 100 - (impulseRatio * 50));
        
        // Calculate investment performance (based on planned vs impulse spending)
        // More planned spending = better investment mindset
        const plannedCount = totalCount - impulseCount;
        const plannedRatio = totalCount > 0 ? (plannedCount / totalCount) : 1;
        // Investment performance: higher if more planned spending
        let investmentPerformance = Math.min(100, plannedRatio * 100);
        
        // Update metrics on backend
        const updateData = {
            budgetAdherence: Math.round(budgetAdherence),
            savingProgress: Math.round(savingProgress),
            investmentPerformance: Math.round(investmentPerformance)
        };
        
        // Use authenticated fetch if available, otherwise regular fetch
        let response;
        try {
            if (typeof authenticatedFetch === 'function') {
                response = await authenticatedFetch(`${API_BASE_URL}/user/${currentUserId}/metrics`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });
            } else {
                response = await fetch(`${API_BASE_URL}/user/${currentUserId}/metrics`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });
            }
            
            if (response && response.ok) {
                console.log('✅ Budget metrics updated successfully');
                // Show success message
                showMetricUpdateSuccess();
            } else {
                const errorText = response ? await response.text() : 'No response';
                console.warn('Failed to update metrics (non-critical):', errorText);
            }
        } catch (fetchError) {
            console.warn('Could not update metrics (non-critical):', fetchError);
        }
    } catch (error) {
        console.error('Error updating budget metrics:', error);
        // Don't throw - this is non-critical
    }
}

// Show success message when metrics are updated
function showMetricUpdateSuccess() {
    const message = document.createElement('div');
    message.className = 'alert alert-success mt-2';
    message.innerHTML = '<span style="color: #4facfe;">✨</span> Budget metrics updated! Check your dashboard to see the changes.';
    document.getElementById('expenseForm').appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

function analyzeWithAI(description) {
    if (!description) {
        description = document.getElementById('expenseDescription').value;
    }
    
    if (!description) {
        alert('Please enter a description first');
        return;
    }
    
    // Simulate AI categorization
    const categorySelect = document.getElementById('expenseCategory');
    const lowerDesc = description.toLowerCase();
    
    let detectedCategory = 'other';
    if (lowerDesc.includes('coffee') || lowerDesc.includes('food') || lowerDesc.includes('restaurant') || lowerDesc.includes('starbucks') || lowerDesc.includes('mcdonald')) {
        detectedCategory = 'food';
    } else if (lowerDesc.includes('uber') || lowerDesc.includes('taxi') || lowerDesc.includes('gas') || lowerDesc.includes('fuel') || lowerDesc.includes('parking')) {
        detectedCategory = 'transport';
    } else if (lowerDesc.includes('movie') || lowerDesc.includes('netflix') || lowerDesc.includes('spotify') || lowerDesc.includes('game')) {
        detectedCategory = 'entertainment';
    } else if (lowerDesc.includes('amazon') || lowerDesc.includes('store') || lowerDesc.includes('shopping') || lowerDesc.includes('clothes')) {
        detectedCategory = 'shopping';
    } else if (lowerDesc.includes('bill') || lowerDesc.includes('electric') || lowerDesc.includes('water') || lowerDesc.includes('internet')) {
        detectedCategory = 'bills';
    } else if (lowerDesc.includes('doctor') || lowerDesc.includes('pharmacy') || lowerDesc.includes('medicine') || lowerDesc.includes('hospital')) {
        detectedCategory = 'health';
    }
    
    categorySelect.value = detectedCategory;
    
    // Show AI analysis message
    const message = document.createElement('div');
    message.className = 'alert alert-info mt-2';
    message.innerHTML = `<span style="color: #667eea;">◉</span> AI detected: <strong>${detectedCategory.charAt(0).toUpperCase() + detectedCategory.slice(1)}</strong> category`;
    document.getElementById('expenseForm').appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

function displayIngredientShelf() {
    const shelf = document.getElementById('ingredientShelf');
    if (!shelf) {
        console.warn('ingredientShelf element not found');
        return;
    }
    
    if (!transactions || transactions.length === 0) {
        shelf.innerHTML = '<div class="text-center text-muted py-5"><p>No ingredients yet. Add your first expense above!</p></div>';
        return;
    }
    
    console.log('Displaying ingredient shelf with', transactions.length, 'transactions');
    shelf.innerHTML = '';
    
    // Group by category
    const byCategory = {};
    transactions.forEach(t => {
        if (!byCategory[t.category]) {
            byCategory[t.category] = [];
        }
        byCategory[t.category].push(t);
    });
    
    Object.keys(byCategory).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'ingredient-category mb-4';
        
        const categoryHeader = document.createElement('h5');
        categoryHeader.innerHTML = `${categoryIcons[category] || categoryIcons.other} ${category.charAt(0).toUpperCase() + category.slice(1)}`;
        categoryDiv.appendChild(categoryHeader);
        
        const ingredientsRow = document.createElement('div');
        ingredientsRow.className = 'ingredients-row';
        
        byCategory[category].slice(0, 10).forEach(transaction => {
            const ingredient = document.createElement('div');
            ingredient.className = 'ingredient-item';
            ingredient.style.backgroundColor = categoryColors[category] || categoryColors.other;
            
            if (transaction.isImpulse) {
                ingredient.classList.add('impulse-buy');
            }
            
            ingredient.innerHTML = `
                <div class="ingredient-icon">${categoryIcons[category] || categoryIcons.other}</div>
                <div class="ingredient-amount">$${transaction.amount.toFixed(2)}</div>
                ${transaction.isImpulse ? '<div class="impulse-badge">⚡</div>' : ''}
            `;
            
            ingredient.onclick = () => showTransactionDetails(transaction);
            ingredientsRow.appendChild(ingredient);
        });
        
        categoryDiv.appendChild(ingredientsRow);
        shelf.appendChild(categoryDiv);
    });
}

function displayTransactions() {
    const tableBody = document.getElementById('transactionsTable');
    if (!tableBody) {
        console.warn('transactionsTable element not found');
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (!transactions || transactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No transactions yet</td></tr>';
        return;
    }
    
    console.log('Displaying', transactions.length, 'transactions');
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        if (transaction.isImpulse) {
            row.classList.add('impulse-row');
        }
        
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.description}</td>
            <td>
                <span class="badge" style="background-color: ${categoryColors[transaction.category] || categoryColors.other}">
                    ${categoryIcons[transaction.category] || categoryIcons.other} ${transaction.category}
                </span>
            </td>
            <td><strong>$${transaction.amount.toFixed(2)}</strong></td>
            <td>${transaction.isImpulse ? '<span class="badge bg-warning">⚡ Impulse</span>' : '<span class="badge bg-success">Planned</span>'}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction(${transaction.id})">Delete</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function showTransactionDetails(transaction) {
    alert(`Transaction Details:\n\nDescription: ${transaction.description}\nAmount: $${transaction.amount.toFixed(2)}\nCategory: ${transaction.category}\nDate: ${transaction.date}\nType: ${transaction.isImpulse ? 'Impulse Buy ⚡' : 'Planned'}`);
}

async function deleteTransaction(id) {
    if (confirm('Delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        displayTransactions();
        displayIngredientShelf();
        
        // Recalculate and update budget metrics
        await updateBudgetMetrics();
    }
}

function showImpulseSparkle() {
    // Create sparkle animation
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle-animation';
    sparkle.innerHTML = '<span style="color: #f093fb; font-size: 4rem;">✦</span>';
    document.body.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 2000);
}

function loadTransactions() {
    try {
        const saved = localStorage.getItem('budgetbrew_transactions');
        if (saved) {
            transactions = JSON.parse(saved);
            console.log('Loaded', transactions.length, 'transactions from localStorage');
        } else {
            transactions = [];
            console.log('No saved transactions, initializing empty array');
        }
        
        // Ensure transactions is an array
        if (!Array.isArray(transactions)) {
            console.warn('transactions was not an array, resetting');
            transactions = [];
        }
        
        displayTransactions();
        displayIngredientShelf();
    } catch (error) {
        console.error('Error loading transactions:', error);
        transactions = [];
        displayTransactions();
        displayIngredientShelf();
    }
}

function saveTransactions() {
    try {
        if (!Array.isArray(transactions)) {
            console.warn('transactions is not an array, cannot save');
            return;
        }
        localStorage.setItem('budgetbrew_transactions', JSON.stringify(transactions));
        console.log('Saved', transactions.length, 'transactions to localStorage');
    } catch (error) {
        console.error('Error saving transactions:', error);
    }
}

