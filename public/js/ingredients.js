// Ingredients (Transactions) JavaScript

let transactions = [];

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

document.addEventListener('DOMContentLoaded', () => {
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

function addExpense() {
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const description = document.getElementById('expenseDescription').value;
    const category = document.getElementById('expenseCategory').value || 'other';
    const isImpulse = document.getElementById('isImpulseBuy').checked;
    
    const transaction = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        description: description,
        category: category,
        amount: amount,
        isImpulse: isImpulse
    };
    
    transactions.unshift(transaction);
    saveTransactions();
    displayTransactions();
    displayIngredientShelf();
    
    // Reset form
    document.getElementById('expenseForm').reset();
    
    // Show sparkle animation if impulse buy
    if (isImpulse) {
        showImpulseSparkle();
    }
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
    
    if (transactions.length === 0) {
        shelf.innerHTML = '<div class="text-center text-muted py-5"><p>No ingredients yet. Add your first expense above!</p></div>';
        return;
    }
    
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
    tableBody.innerHTML = '';
    
    if (transactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No transactions yet</td></tr>';
        return;
    }
    
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

function deleteTransaction(id) {
    if (confirm('Delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        displayTransactions();
        displayIngredientShelf();
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
    const saved = localStorage.getItem('budgetbrew_transactions');
    if (saved) {
        transactions = JSON.parse(saved);
    }
    displayTransactions();
    displayIngredientShelf();
}

function saveTransactions() {
    localStorage.setItem('budgetbrew_transactions', JSON.stringify(transactions));
}

