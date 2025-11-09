// Potions Lab JavaScript

let ingredients = {
    savings: 10,
    budget: 8,
    knowledge: 5,
    investment: 6
};

let activePotions = [];

const potionRecipes = {
    challenge: {
        name: 'Challenge Potion',
        icon: '<span style="color: #667eea; font-size: 1.3em;">🛡</span>',
        requirements: { savings: 3, budget: 2 },
        effect: 'Reduces penalties and improves budget adherence',
        duration: 7 // days
    },
    savings: {
        name: 'Savings Elixir',
        icon: '<span style="color: #f093fb; font-size: 1.3em;">💎</span>',
        requirements: { savings: 5, investment: 2 },
        effect: 'Boosts score multipliers and accelerates savings',
        duration: 14
    },
    subscription: {
        name: 'Subscription Dissolver',
        icon: '<span style="color: #764ba2; font-size: 1.3em;">🧹</span>',
        requirements: { budget: 4, knowledge: 2 },
        effect: 'AI suggests unused subscriptions to cancel',
        duration: 30
    },
    knowledge: {
        name: 'Knowledge Boost',
        icon: '<span style="color: #4facfe; font-size: 1.3em;">🧠</span>',
        requirements: { knowledge: 5, savings: 2 },
        effect: 'Unlocks advanced financial literacy modules',
        duration: 30
    },
    investment: {
        name: 'Investment Catalyst',
        icon: '<span style="color: #00f2fe; font-size: 1.3em;">📈</span>',
        requirements: { investment: 4, knowledge: 3 },
        effect: 'Enhances investment performance insights',
        duration: 14
    },
    budget: {
        name: 'Budget Stabilizer',
        icon: '<span style="color: #a78bfa; font-size: 1.3em;">⚖</span>',
        requirements: { budget: 5, savings: 3 },
        effect: 'Maintains consistent budget adherence',
        duration: 7
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadIngredients();
    loadActivePotions();
    updateInventoryDisplay();
    displayActivePotions();
});

function loadIngredients() {
    const saved = localStorage.getItem('budgetbrew_ingredients');
    if (saved) {
        ingredients = JSON.parse(saved);
    } else {
        // Initialize with demo values
        saveIngredients();
    }
}

function saveIngredients() {
    localStorage.setItem('budgetbrew_ingredients', JSON.stringify(ingredients));
}

function loadActivePotions() {
    const saved = localStorage.getItem('budgetbrew_active_potions');
    if (saved) {
        activePotions = JSON.parse(saved);
        // Remove expired potions
        const now = Date.now();
        activePotions = activePotions.filter(potion => potion.expiresAt > now);
        saveActivePotions();
    }
}

function saveActivePotions() {
    localStorage.setItem('budgetbrew_active_potions', JSON.stringify(activePotions));
}

function updateInventoryDisplay() {
    document.getElementById('savingsIngredient').textContent = ingredients.savings;
    document.getElementById('budgetIngredient').textContent = ingredients.budget;
    document.getElementById('knowledgeIngredient').textContent = ingredients.knowledge;
    document.getElementById('investmentIngredient').textContent = ingredients.investment;
}

function brewPotion(potionType) {
    const recipe = potionRecipes[potionType];
    
    if (!recipe) {
        alert('Unknown potion type');
        return;
    }
    
    // Check if user has required ingredients
    for (const [ingredient, amount] of Object.entries(recipe.requirements)) {
        if (ingredients[ingredient] < amount) {
            alert(`Not enough ${ingredient} ingredients! You need ${amount}, but only have ${ingredients[ingredient]}.`);
            return;
        }
    }
    
    // Consume ingredients
    for (const [ingredient, amount] of Object.entries(recipe.requirements)) {
        ingredients[ingredient] -= amount;
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
    
    activePotions.push(potion);
    
    saveIngredients();
    saveActivePotions();
    updateInventoryDisplay();
    displayActivePotions();
    
    // Show brewing animation
    showBrewingAnimation(potion);
    
    alert(`✦ ${recipe.name} brewed successfully!\n\nEffect: ${recipe.effect}\nDuration: ${recipe.duration} days`);
}

function showBrewingAnimation(potion) {
    const animation = document.createElement('div');
    animation.className = 'brewing-animation';
    animation.innerHTML = `
        <div class="brewing-cauldron-mini">
            <div class="brewing-liquid"></div>
            <div class="brewing-sparkles"><span style="color: #f093fb;">✦</span><span style="color: #f093fb;">✦</span><span style="color: #f093fb;">✦</span></div>
        </div>
        <p>Brewing ${potion.name}...</p>
    `;
    document.body.appendChild(animation);
    
    setTimeout(() => {
        animation.remove();
    }, 3000);
}

function displayActivePotions() {
    const container = document.getElementById('activePotions');
    
    if (activePotions.length === 0) {
        container.innerHTML = '<div class="text-center py-3"><p class="no-potions-text">No active potions. Brew one to get started!</p></div>';
        return;
    }
    
    container.innerHTML = '';
    
    activePotions.forEach(potion => {
        const daysLeft = Math.ceil((potion.expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
        const potionCard = document.createElement('div');
        potionCard.className = 'card magical-card mb-3';
        potionCard.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="card-title mb-1">
                            <span class="potion-icon-large">${potion.icon}</span> ${potion.name}
                        </h5>
                        <p class="card-text mb-0"><small>${potion.effect}</small></p>
                    </div>
                    <div class="text-end">
                        <div class="badge bg-success">${daysLeft} days left</div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(potionCard);
    });
}

// Update ingredients based on user activity (called from other pages)
function addIngredient(type, amount = 1) {
    if (ingredients[type] !== undefined) {
        ingredients[type] += amount;
        saveIngredients();
        updateInventoryDisplay();
    }
}

// Expose function globally for other pages
window.addIngredient = addIngredient;

