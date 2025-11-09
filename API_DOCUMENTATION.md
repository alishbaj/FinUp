# BudgetBrew Backend API Documentation

## Overview

The BudgetBrew backend is a Node.js/Express server that provides RESTful API endpoints for managing user data, ingredients, potions, quizzes, and activities.

## Base URL

```
http://localhost:3000/api
```

## API Endpoints

### User Data

#### GET `/api/user/:id`
Get user data including calculated FinScore.

**Response:**
```json
{
  "id": "1",
  "name": "Alice Johnson",
  "budgetAdherence": 85,
  "savingProgress": 72,
  "investmentPerformance": 68,
  "quizScore": 90,
  "finScore": 78.5,
  "ingredients": {
    "savings": 10,
    "budget": 8,
    "knowledge": 5,
    "investment": 6
  },
  "activePotions": [],
  "activities": []
}
```

#### GET `/api/users`
Get all users sorted by FinScore (for leaderboard).

**Response:** Array of user objects with FinScore

---

### Quiz

#### GET `/api/quiz`
Get all quiz questions.

**Response:**
```json
[
  {
    "id": 1,
    "question": "What is the recommended percentage of income to save?",
    "options": ["10%", "20%", "30%", "50%"],
    "correct": 1
  }
]
```

#### POST `/api/quiz/submit`
Submit quiz answers and get results with ingredient awards.

**Request Body:**
```json
{
  "userId": "1",
  "answers": {
    "1": 1,
    "2": 1,
    "3": 1,
    "4": 0,
    "5": 1
  }
}
```

**Response:**
```json
{
  "score": 80,
  "finScore": 79.2,
  "ingredientsAwarded": {
    "knowledge": 4,
    "savings": 1
  },
  "ingredients": {
    "savings": 11,
    "budget": 8,
    "knowledge": 9,
    "investment": 6
  }
}
```

---

### Ingredients

#### GET `/api/user/:id/ingredients`
Get user's ingredient inventory.

**Response:**
```json
{
  "savings": 10,
  "budget": 8,
  "knowledge": 5,
  "investment": 6
}
```

#### POST `/api/user/:id/ingredients`
Update user ingredients (manual update).

**Request Body:**
```json
{
  "ingredients": {
    "savings": 15,
    "budget": 10
  }
}
```

---

### Potions

#### GET `/api/user/:id/potions`
Get active potions for user (expired potions are automatically filtered).

**Response:**
```json
[
  {
    "type": "challenge",
    "name": "Challenge Potion",
    "icon": "🛡",
    "effect": "Reduces penalties and improves budget adherence",
    "brewedAt": 1234567890,
    "expiresAt": 1235173890
  }
]
```

#### POST `/api/user/:id/potions/brew`
Brew a potion using ingredients.

**Request Body:**
```json
{
  "potionType": "challenge"
}
```

**Response:**
```json
{
  "success": true,
  "potion": {
    "type": "challenge",
    "name": "Challenge Potion",
    "icon": "🛡",
    "effect": "Reduces penalties and improves budget adherence",
    "brewedAt": 1234567890,
    "expiresAt": 1235173890
  },
  "ingredients": {
    "savings": 7,
    "budget": 6,
    "knowledge": 5,
    "investment": 6
  }
}
```

**Error Response (if not enough ingredients):**
```json
{
  "error": "Not enough savings ingredients",
  "required": 3,
  "have": 2
}
```

---

### Activities

#### POST `/api/user/:id/activity`
Record an activity and award ingredients automatically.

**Request Body:**
```json
{
  "activityType": "budget",
  "score": 85
}
```

**Activity Types:**
- `quiz` - Quiz completion
- `budget` - Budget adherence achievement
- `savings` - Savings progress
- `investment` - Investment performance

**Response:**
```json
{
  "ingredients": {
    "savings": 11,
    "budget": 11,
    "knowledge": 5,
    "investment": 6
  },
  "ingredientsAwarded": {
    "budget": 3,
    "savings": 1
  }
}
```

---

### Metrics

#### PUT `/api/user/:id/metrics`
Update user financial metrics (budget, savings, investment). Automatically awards ingredients for good performance.

**Request Body:**
```json
{
  "budgetAdherence": 90,
  "savingProgress": 75,
  "investmentPerformance": 80
}
```

**Response:**
```json
{
  "id": "1",
  "name": "Alice Johnson",
  "budgetAdherence": 90,
  "savingProgress": 75,
  "investmentPerformance": 80,
  "quizScore": 90,
  "finScore": 83.5,
  "ingredients": { ... },
  "activePotions": [ ... ]
}
```

---

## Ingredient Award System

Ingredients are automatically awarded based on activities:

### Quiz
- Knowledge: 1 per 20 points scored
- Savings: 2 if score ≥ 80, 1 if score ≥ 60

### Budget Adherence
- Budget: 3 if score ≥ 80, 2 if score ≥ 60, 1 otherwise
- Savings: 1 if score ≥ 80

### Savings Progress
- Savings: 3 if score ≥ 80, 2 if score ≥ 60, 1 otherwise

### Investment Performance
- Investment: 3 if score ≥ 80, 2 if score ≥ 60, 1 otherwise

---

## FinScore Calculation

FinScore is calculated using weighted formula:

```
FinScore = (Budget Adherence × 0.3) + 
           (Saving Progress × 0.3) + 
           (Investment Performance × 0.2) + 
           (Quiz Score × 0.2)
```

All metrics are percentages (0-100), resulting in a FinScore range of 0-100.

---

## Data Storage

All data is stored in `data.json` file. The server reads and writes to this file for persistence.

**Data Structure:**
```json
{
  "users": [
    {
      "id": "1",
      "name": "Alice Johnson",
      "budgetAdherence": 85,
      "savingProgress": 72,
      "investmentPerformance": 68,
      "quizScore": 90,
      "ingredients": { ... },
      "activePotions": [ ... ],
      "activities": [ ... ]
    }
  ],
  "quizQuestions": [ ... ]
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found (user doesn't exist)
- `500` - Server Error

Error responses include an `error` field:
```json
{
  "error": "User not found"
}
```

---

## Frontend Integration

### Current User ID

Currently, all frontend pages use a hardcoded `CURRENT_USER_ID = '1'`. To implement user authentication:

1. Add login/session management
2. Store current user ID in session or localStorage
3. Update `CURRENT_USER_ID` constant in all frontend JS files

### Example Frontend Call

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
const CURRENT_USER_ID = '1';

// Fetch user data
const response = await fetch(`${API_BASE_URL}/user/${CURRENT_USER_ID}`);
const userData = await response.json();

// Submit quiz
const quizResponse = await fetch(`${API_BASE_URL}/quiz/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        userId: CURRENT_USER_ID,
        answers: { 1: 1, 2: 1, ... }
    })
});
```

---

## Testing

To test the API:

1. Start the server: `npm start`
2. Use a tool like Postman or curl to test endpoints
3. Or test directly from the frontend pages

Example curl commands:

```bash
# Get user data
curl http://localhost:3000/api/user/1

# Get all users
curl http://localhost:3000/api/users

# Submit quiz
curl -X POST http://localhost:3000/api/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{"userId":"1","answers":{"1":1,"2":1,"3":1,"4":0,"5":1}}'

# Brew potion
curl -X POST http://localhost:3000/api/user/1/potions/brew \
  -H "Content-Type: application/json" \
  -d '{"potionType":"challenge"}'
```

