// Potions Lab JavaScript

const API_BASE_URL = 'http://localhost:3000/api';
const CURRENT_USER_ID = '1'; // Default user ID - can be changed based on login

let ingredients = {
    savings: 0,
    budget: 0,
    knowledge: 0,
    investment: 0
};

let activePotions = [];

document.addEventListener('DOMContentLoaded', () => {
    loadIngredients();
    loadActivePotions();
});

async function loadIngredients() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/${CURRENT_USER_ID}/ingredients`);
        if (!response.ok) {
            throw new Error('Failed to fetch ingredients');
        }
        ingredients = await response.json();
        updateInventoryDisplay();
    } catch (error) {
        console.error('Error loading ingredients:', error);
        // Keep default values on error
        updateInventoryDisplay();
    }
}

async function loadActivePotions() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/${CURRENT_USER_ID}/potions`);
        if (!response.ok) {
            throw new Error('Failed to fetch potions');
        }
        activePotions = await response.json();
        displayActivePotions();
    } catch (error) {
        console.error('Error loading potions:', error);
        activePotions = [];
        displayActivePotions();
    }
}

function updateInventoryDisplay() {
    document.getElementById('savingsIngredient').textContent = ingredients.savings;
    document.getElementById('budgetIngredient').textContent = ingredients.budget;
    document.getElementById('knowledgeIngredient').textContent = ingredients.knowledge;
    document.getElementById('investmentIngredient').textContent = ingredients.investment;
}

async function brewPotion(potionType) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/${CURRENT_USER_ID}/potions/brew`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ potionType: potionType })
        });
        
        if (!response.ok) {
            const error = await response.json();
            alert(`Failed to brew potion: ${error.error}`);
            return;
        }
        
        const result = await response.json();
        
        // Update local state
        ingredients = result.ingredients;
        activePotions.push(result.potion);
        
        updateInventoryDisplay();
        displayActivePotions();
        
        // Show brewing animation
        showBrewingAnimation(result.potion);
        
        // Get duration from potion data
        const daysLeft = Math.ceil((result.potion.expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
        alert(`✦ ${result.potion.name} brewed successfully!\n\nEffect: ${result.potion.effect}\nDuration: ${daysLeft} days`);
    } catch (error) {
        console.error('Error brewing potion:', error);
        alert('Failed to brew potion. Please try again.');
    }
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

// Reload ingredients from server (call this after activities that award ingredients)
async function refreshIngredients() {
    await loadIngredients();
}

