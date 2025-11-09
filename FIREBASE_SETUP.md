# Firebase Authentication Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard
4. Enable Authentication:
   - Go to Authentication → Get Started
   - Enable "Email/Password" sign-in method
   - (Optional) Enable "Anonymous" for guest users

## Step 2: Get Firebase Admin SDK Credentials (Backend)

1. In Firebase Console, go to Project Settings (gear icon)
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. **Rename it to `firebase-admin-key.json`**
6. **Place it in your project root folder** (same level as server.js)
7. **IMPORTANT:** Already added to `.gitignore` - never commit this file!

## Step 3: Get Firebase Web Config (Frontend)

1. In Firebase Console → Project Settings → General
2. Scroll to "Your apps" section
3. Click the `</>` icon to add a web app (if not already added)
   - Give it a nickname like "BudgetBrew Web"
   - Click "Register app"
4. **You'll see a code block that looks like this:**
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuv",
     authDomain: "your-project-12345.firebaseapp.com",
     projectId: "your-project-12345",
     storageBucket: "your-project-12345.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef1234567890"
   };
   ```

5. **Copy that ENTIRE object** (the part inside the curly braces `{...}`)

6. Create a new file: `public/js/firebase-config.js`

7. **Paste it and add the initialization line:**
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuv",  // ← Your actual values from Firebase
     authDomain: "your-project-12345.firebaseapp.com",
     projectId: "your-project-12345",
     storageBucket: "your-project-12345.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef1234567890"
   };
   
   // Initialize Firebase
   firebase.initializeApp(firebaseConfig);
   ```

**Important:** Replace the example values with YOUR actual values from Firebase Console!

## Step 4: Install Dependencies

```bash
npm install firebase-admin
```

For frontend, add Firebase SDK to your HTML:
```html
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js"></script>
```

## Step 5: How It Works

### Backend (Already Set Up)
- `firebase-auth.js` - Handles Firebase Admin SDK initialization
- `server.js` - Uses `optionalAuth` middleware
- Works with or without Firebase configured (falls back to userId)

### Frontend (You Need to Add)
1. Include Firebase SDK in HTML:
   ```html
   <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
   <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js"></script>
   <script src="js/firebase-config.js"></script>
   <script src="js/auth.js"></script>
   ```

2. Use authenticated requests:
   ```javascript
   // Instead of regular fetch
   const userData = await getCurrentUserData();
   
   // Or use authenticatedFetch
   const response = await authenticatedFetch('/api/user/me');
   ```

## Step 6: Update Your Pages

### Example: Add Login to index.html

```html
<!-- Add Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js"></script>
<script src="js/firebase-config.js"></script>
<script src="js/auth.js"></script>

<!-- Login Form -->
<div id="loginForm">
    <input type="email" id="email" placeholder="Email">
    <input type="password" id="password" placeholder="Password">
    <button onclick="handleLogin()">Login</button>
    <button onclick="handleSignup()">Sign Up</button>
</div>

<script>
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const result = await signIn(email, password);
    if (result.success) {
        // User logged in, load their data
        loadUserData();
    } else {
        alert('Login failed: ' + result.error);
    }
}

async function loadUserData() {
    const userData = await getCurrentUserData();
    // Display user data...
}
</script>
```

## Step 7: API Endpoints

### With Authentication:
```javascript
// Get current user (uses Firebase token)
GET /api/user/me
Headers: Authorization: Bearer <firebase-token>
```

### Without Authentication (Fallback):
```javascript
// Still works with userId
GET /api/user/1
```

## Current Status

✅ Backend is ready - works with or without Firebase
✅ Authentication middleware is set up
✅ User creation on first login is automatic
⏳ Frontend needs Firebase SDK and config added

## Testing

1. **Without Firebase (Current):**
   - Everything works as before
   - Uses userId from query/body

2. **With Firebase:**
   - Install dependencies: `npm install`
   - Add `firebase-admin-key.json` to root
   - Add `firebase-config.js` to `public/js/`
   - Add Firebase SDK to HTML pages
   - Users can sign up/login
   - Backend automatically creates user on first login

## Security Notes

- ✅ Firebase Admin key is in `.gitignore`
- ✅ Tokens are verified on backend
- ✅ User data linked to Firebase UID
- ⚠️ Don't commit `firebase-admin-key.json` or `firebase-config.js`

