# How Firebase Authentication Works with data.json

## Two Separate Storage Systems

### 1. Firebase Authentication (Cloud)
**Stores:** Login credentials
- Email addresses
- Passwords (encrypted)
- User IDs (Firebase UIDs)
- Authentication tokens

**Location:** Firebase cloud (managed by Google)
**You don't manage this** - Firebase handles it automatically

### 2. data.json (Local File)
**Stores:** User financial data
- Budget adherence
- Savings progress
- Investment performance
- Quiz scores
- Ingredients
- Potions
- Activities

**Location:** Your local `data.json` file
**You manage this** - Your backend reads/writes to it

## How They Work Together

### When User Signs Up:

1. **Firebase Authentication:**
   ```
   User enters: email + password
   → Firebase stores credentials in cloud
   → Firebase returns: Firebase UID (like "abc123xyz...")
   ```

2. **Your Backend (data.json):**
   ```
   Backend receives: Firebase UID + email
   → Creates user record in data.json
   → Links user data to Firebase UID
   ```

### When User Signs In:

1. **Firebase Authentication:**
   ```
   User enters: email + password
   → Firebase verifies credentials
   → Firebase returns: Authentication token
   ```

2. **Your Backend:**
   ```
   Backend receives: Authentication token
   → Verifies token with Firebase
   → Gets Firebase UID from token
   → Looks up user in data.json using Firebase UID
   → Returns user's financial data
   ```

## Example Flow

### User Signs Up:
```
1. User fills form: email="alice@example.com", password="secret123"
2. Frontend calls: signUp('alice@example.com', 'secret123')
3. Firebase creates account in cloud
4. User logs in automatically
5. Frontend calls: getCurrentUserData()
6. Backend creates user in data.json:
   {
     "id": "6",
     "firebaseUid": "abc123xyz...",
     "email": "alice@example.com",
     "name": "alice",
     "budgetAdherence": 0,
     "savingProgress": 0,
     ...
   }
```

### User Signs In Later:
```
1. User enters: email + password
2. Firebase verifies → returns token
3. Frontend sends token to backend
4. Backend verifies token → gets Firebase UID
5. Backend finds user in data.json by firebaseUid
6. Returns user's financial data
```

## What Gets Saved Where

### Firebase Authentication (Cloud):
✅ Email address
✅ Password (encrypted)
✅ Firebase UID
✅ Login session tokens

### data.json (Local):
✅ Financial metrics (budget, savings, etc.)
✅ Ingredients inventory
✅ Active potions
✅ Quiz scores
✅ Activity history
✅ FinScore

## Answer to Your Question

**"Can I enter my signing credentials and will it save?"**

**YES!** Here's what happens:

1. **Sign Up:**
   - Enter email + password
   - Firebase saves credentials in cloud ✅
   - Backend creates user in data.json ✅
   - Both are saved!

2. **Sign In:**
   - Enter email + password
   - Firebase verifies credentials ✅
   - Backend loads your data from data.json ✅
   - You're logged in!

## Testing It

Try this in browser console:

```javascript
// 1. Sign up (creates account in Firebase + data.json)
await signUp('your@email.com', 'password123')

// 2. Check your data was created
await getCurrentUserData()

// 3. Sign out
await signOut()

// 4. Sign in again (uses saved credentials)
await signIn('your@email.com', 'password123')

// 5. Your data is still there!
await getCurrentUserData()
```

## Summary

- **Firebase Auth** = Login system (credentials in cloud)
- **data.json** = Your app data (financial info locally)
- **They work together** = Auth verifies who you are, data.json stores your info
- **Everything saves automatically** when you use the app!

