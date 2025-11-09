// Academy JavaScript

const API_BASE_URL = 'http://localhost:3000/api';

let courseProgress = {
    compound: 0,
    credit: 0,
    budgeting: 0,
    investment: 0,
    emergency: 0,
    debt: 0
};

document.addEventListener('DOMContentLoaded', () => {
    loadCourseProgress();
    updateCourseProgress();
});

function loadCourseProgress() {
    const saved = localStorage.getItem('budgetbrew_course_progress');
    if (saved) {
        courseProgress = JSON.parse(saved);
    }
}

function saveCourseProgress() {
    localStorage.setItem('budgetbrew_course_progress', JSON.stringify(courseProgress));
}

function updateCourseProgress() {
    Object.keys(courseProgress).forEach(course => {
        const progress = courseProgress[course];
        const progressElement = document.getElementById(`${course}Progress`);
        const progressBar = document.getElementById(`${course}ProgressBar`);
        
        if (progressElement) {
            progressElement.textContent = progress + '%';
        }
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    });
}

function startCourse(courseName) {
    const courseContent = {
        compound: {
            title: 'Scroll of Compound Interest',
            content: `
                <h4>What is Compound Interest?</h4>
                <p>Compound interest is interest calculated on the initial principal and also on the accumulated interest of previous periods. It's often called "interest on interest."</p>
                <h5>Key Concepts:</h5>
                <ul>
                    <li><strong>Principal:</strong> The initial amount of money</li>
                    <li><strong>Interest Rate:</strong> The percentage earned or paid</li>
                    <li><strong>Compounding Frequency:</strong> How often interest is calculated (daily, monthly, annually)</li>
                </ul>
                <h5>Example:</h5>
                <p>If you invest $1,000 at 5% annual interest, compounded yearly:</p>
                <ul>
                    <li>Year 1: $1,000 × 1.05 = $1,050</li>
                    <li>Year 2: $1,050 × 1.05 = $1,102.50</li>
                    <li>Year 3: $1,102.50 × 1.05 = $1,157.63</li>
                </ul>
                <p><strong>Formula:</strong> A = P(1 + r/n)^(nt)</p>
                <p>Where: A = final amount, P = principal, r = interest rate, n = compounding frequency, t = time</p>
            `,
            reward: { knowledge: 2 }
        },
        credit: {
            title: 'Runes of Credit Utilization',
            content: `
                <h4>Understanding Credit Utilization</h4>
                <p>Credit utilization is the ratio of your credit card balances to your credit limits. It's a major factor in your credit score.</p>
                <h5>Key Points:</h5>
                <ul>
                    <li><strong>Ideal Ratio:</strong> Keep utilization below 30%</li>
                    <li><strong>Calculation:</strong> (Total Credit Used / Total Credit Limit) × 100</li>
                    <li><strong>Impact:</strong> High utilization can lower your credit score</li>
                </ul>
                <h5>Tips to Improve:</h5>
                <ul>
                    <li>Pay off balances before the statement date</li>
                    <li>Request credit limit increases</li>
                    <li>Use multiple cards strategically</li>
                    <li>Pay more than the minimum payment</li>
                </ul>
            `,
            reward: { knowledge: 2 }
        },
        budgeting: {
            title: 'Tome of Budgeting',
            content: `
                <h4>Creating an Effective Budget</h4>
                <p>A budget is a plan for your money that helps you track income and expenses.</p>
                <h5>50/30/20 Rule:</h5>
                <ul>
                    <li><strong>50%</strong> for Needs (housing, food, utilities)</li>
                    <li><strong>30%</strong> for Wants (entertainment, dining out)</li>
                    <li><strong>20%</strong> for Savings and Debt Repayment</li>
                </ul>
                <h5>Steps to Create a Budget:</h5>
                <ol>
                    <li>Calculate your total monthly income</li>
                    <li>List all monthly expenses</li>
                    <li>Categorize expenses (needs vs wants)</li>
                    <li>Set spending limits for each category</li>
                    <li>Track your spending regularly</li>
                    <li>Adjust as needed</li>
                </ol>
            `,
            reward: { knowledge: 2, budget: 1 }
        },
        investment: {
            title: 'Grimoire of Investments',
            content: `
                <h4>Introduction to Investing</h4>
                <p>Investing is putting money to work to generate returns over time.</p>
                <h5>Types of Investments:</h5>
                <ul>
                    <li><strong>Stocks:</strong> Ownership shares in companies</li>
                    <li><strong>Bonds:</strong> Loans to companies or governments</li>
                    <li><strong>Mutual Funds:</strong> Diversified portfolios managed by professionals</li>
                    <li><strong>ETFs:</strong> Exchange-traded funds, similar to mutual funds but trade like stocks</li>
                </ul>
                <h5>Key Principles:</h5>
                <ul>
                    <li><strong>Diversification:</strong> Don't put all eggs in one basket</li>
                    <li><strong>Risk vs Return:</strong> Higher potential returns come with higher risk</li>
                    <li><strong>Time Horizon:</strong> Longer time allows for more risk tolerance</li>
                    <li><strong>Dollar-Cost Averaging:</strong> Invest regularly regardless of market conditions</li>
                </ul>
            `,
            reward: { knowledge: 3, investment: 1 }
        },
        emergency: {
            title: 'Codex of Emergency Funds',
            content: `
                <h4>Building an Emergency Fund</h4>
                <p>An emergency fund is money set aside to cover unexpected expenses or financial emergencies.</p>
                <h5>How Much to Save:</h5>
                <ul>
                    <li><strong>Starter Goal:</strong> $1,000 for small emergencies</li>
                    <li><strong>Full Fund:</strong> 3-6 months of living expenses</li>
                    <li><strong>Extended:</strong> 6-12 months for high-risk situations</li>
                </ul>
                <h5>Where to Keep It:</h5>
                <ul>
                    <li>High-yield savings account</li>
                    <li>Money market account</li>
                    <li>Separate from regular checking account</li>
                    <li>Easily accessible but not too easy to spend</li>
                </ul>
                <h5>When to Use It:</h5>
                <ul>
                    <li>Medical emergencies</li>
                    <li>Job loss</li>
                    <li>Major car or home repairs</li>
                    <li>Unexpected large expenses</li>
                </ul>
            `,
            reward: { knowledge: 2, savings: 1 }
        },
        debt: {
            title: 'Manual of Debt Management',
            content: `
                <h4>Strategies for Debt Management</h4>
                <p>Effective debt management helps you pay off debt faster and save on interest.</p>
                <h5>Debt Payoff Strategies:</h5>
                <ul>
                    <li><strong>Debt Snowball:</strong> Pay smallest debts first for quick wins</li>
                    <li><strong>Debt Avalanche:</strong> Pay highest interest debts first to save money</li>
                    <li><strong>Debt Consolidation:</strong> Combine multiple debts into one payment</li>
                </ul>
                <h5>Tips for Success:</h5>
                <ul>
                    <li>Make minimum payments on all debts</li>
                    <li>Put extra money toward one debt at a time</li>
                    <li>Negotiate lower interest rates when possible</li>
                    <li>Avoid taking on new debt while paying off old debt</li>
                    <li>Consider balance transfer cards for high-interest debt</li>
                </ul>
                <h5>Preventing Future Debt:</h5>
                <ul>
                    <li>Build an emergency fund</li>
                    <li>Live within your means</li>
                    <li>Use credit cards responsibly</li>
                    <li>Save for large purchases instead of financing</li>
                </ul>
            `,
            reward: { knowledge: 2, budget: 1 }
        }
    };

    const course = courseContent[courseName];
    if (!course) return;

    // Show course content in modal or alert
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${course.title}</h5>
                    <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                </div>
                <div class="modal-body">
                    ${course.content}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    <button type="button" class="btn btn-primary" onclick="completeCourse('${courseName}')">Mark as Complete</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function completeCourse(courseName) {
    courseProgress[courseName] = 100;
    saveCourseProgress();
    updateCourseProgress();
    
    // Award ingredients
    if (window.addIngredient) {
        const rewards = {
            compound: { knowledge: 2 },
            credit: { knowledge: 2 },
            budgeting: { knowledge: 2, budget: 1 },
            investment: { knowledge: 3, investment: 1 },
            emergency: { knowledge: 2, savings: 1 },
            debt: { knowledge: 2, budget: 1 }
        };
        
        const reward = rewards[courseName];
        if (reward) {
            Object.keys(reward).forEach(type => {
                window.addIngredient(type, reward[type]);
            });
        }
    }
    
    alert('✦ Course completed! You earned ingredients!');
    document.querySelector('.modal').remove();
}

function startQuiz() {
    // Redirect to quiz page or load quiz in modal
    window.location.href = 'quiz.html';
}

function askAITutor() {
    const question = document.getElementById('aiTutorQuestion').value;
    if (!question.trim()) {
        alert('Please enter a question');
        return;
    }
    
    const responseDiv = document.getElementById('aiTutorResponse');
    const answerDiv = document.getElementById('aiTutorAnswer');
    
    // Simulate AI response (in real app, this would call an AI API)
    answerDiv.textContent = `Great question! "${question}"\n\nHere's a simplified explanation:\n\nThis is a demo response. In the full version, this would use AI (like Gemini) to provide personalized explanations based on your financial knowledge level. The AI tutor can explain complex financial concepts in simple terms and adapt to your learning style.`;
    
    responseDiv.style.display = 'block';
}

