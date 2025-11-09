// Quiz JavaScript

const API_BASE_URL = 'http://localhost:3000/api';
const CURRENT_USER_ID = '1'; // Default user ID - can be changed based on login
let questions = [];
let userAnswers = {};

// Load quiz when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadQuiz();
    
    // Add event listeners
    document.getElementById('quizForm').addEventListener('submit', handleSubmit);
    document.getElementById('resetBtn').addEventListener('click', resetQuiz);
    document.getElementById('retakeBtn').addEventListener('click', () => {
        document.getElementById('resultsContainer').style.display = 'none';
        document.getElementById('quizContainer').style.display = 'block';
        resetQuiz();
    });
});

async function loadQuiz() {
    try {
        const response = await fetch(`${API_BASE_URL}/quiz`);
        if (!response.ok) {
            throw new Error('Failed to fetch quiz questions');
        }
        
        questions = await response.json();
        displayQuiz();
    } catch (error) {
        console.error('Error loading quiz:', error);
        document.getElementById('loadingMessage').innerHTML = 
            '<p class="text-danger">Failed to load quiz. Make sure the server is running.</p>';
    }
}

function displayQuiz() {
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.style.display = 'none';
    
    const quizContainer = document.getElementById('quizContainer');
    quizContainer.style.display = 'block';
    
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = '';
    
    questions.forEach((question, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'card question-card';
        
        const questionHTML = `
            <h5 class="question-title">Question ${index + 1}: ${question.question}</h5>
            <div class="options">
                ${question.options.map((option, optIndex) => `
                    <label class="option-label">
                        <input type="radio" name="question${question.id}" value="${optIndex}" required>
                        <span>${option}</span>
                    </label>
                `).join('')}
            </div>
        `;
        
        questionCard.innerHTML = questionHTML;
        questionsContainer.appendChild(questionCard);
    });
}

async function handleSubmit(e) {
    e.preventDefault();
    
    // Collect answers
    questions.forEach(question => {
        const selectedOption = document.querySelector(`input[name="question${question.id}"]:checked`);
        if (selectedOption) {
            userAnswers[question.id] = parseInt(selectedOption.value);
        }
    });
    
    // Submit to backend
    try {
        const response = await fetch(`${API_BASE_URL}/quiz/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: CURRENT_USER_ID,
                answers: userAnswers
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit quiz');
        }
        
        const result = await response.json();
        displayResults(result.score, result.ingredientsAwarded, result.finScore);
    } catch (error) {
        console.error('Error submitting quiz:', error);
        // Fallback to local calculation
        const score = calculateScore();
        displayResults(score, {}, null);
    }
}

function calculateScore() {
    let correctAnswers = 0;
    
    questions.forEach(question => {
        if (userAnswers[question.id] === question.correct) {
            correctAnswers++;
        }
    });
    
    return Math.round((correctAnswers / questions.length) * 100);
}

function displayResults(score, ingredientsAwarded = {}, finScore = null) {
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'block';
    
    document.getElementById('finalScore').textContent = score;
    
    let message = '';
    
    if (score >= 90) {
        message = '<span style="color: #f093fb;">★</span> Excellent! You have a strong understanding of financial literacy! 🌟';
    } else if (score >= 70) {
        message = '<span style="color: #667eea;">◉</span> Good job! You have a solid grasp of financial concepts! 👍';
    } else if (score >= 50) {
        message = '<span style="color: #764ba2;">●</span> Not bad! Keep learning to improve your financial knowledge! 📚';
    } else {
        message = '<span style="color: #4facfe;">▲</span> Keep practicing! Financial literacy is a journey. 💪';
    }
    
    // Show ingredients earned
    if (Object.keys(ingredientsAwarded).length > 0) {
        const ingredientList = Object.entries(ingredientsAwarded)
            .map(([type, amount]) => `${amount} ${type}`)
            .join(', ');
        message += `<br><br><span style="color: #f093fb;">✦</span> You earned: ${ingredientList} ingredient${ingredientList.includes(',') ? 's' : ''}!`;
    }
    
    // Show updated FinScore if available
    if (finScore !== null) {
        message += `<br><br><span style="color: #667eea;">📊</span> Your FinScore is now: ${finScore.toFixed(2)}%`;
    }
    
    document.getElementById('scoreMessage').innerHTML = message;
}

function resetQuiz() {
    userAnswers = {};
    document.getElementById('quizForm').reset();
}

