# Firestore Database Setup Guide

## Current Status

- ✅ Firebase Authentication: Working
- ❌ Firestore Database: Not connected yet
- 📁 Current Storage: `data.json` file

## What is Firestore?

Firestore is Firebase's cloud database. It's like a more powerful version of your `data.json` file that:
- Stores data in the cloud
- Updates in real-time
- Scales automatically
- Works across devices

## Do You Need Firestore?

**Keep JSON file if:**
- This is a hackathon/demo project
- You only need local storage
- You want simple setup

**Use Firestore if:**
- You want cloud storage
- Multiple users need to access data
- You want real-time updates
- You're deploying to production

## How to Connect Firestore

### Step 1: Enable Firestore in Firebase Console

1. Go to Firebase Console → Your Project
2. Click "Firestore Database" in left menu
3. Click "Create database"
4. Choose:
   - **Start in test mode** (for development)
   - Select a location (choose closest to you)
5. Click "Enable"

### Step 2: Install Firestore SDK

```bash
npm install firebase-admin
```

(You already have this!)

### Step 3: Update Backend to Use Firestore

The backend needs to be updated to:
- Read from Firestore instead of `data.json`
- Write to Firestore instead of `data.json`
- Create collections automatically

### Step 4: Update Frontend (Optional)

You can also use Firestore directly from frontend for real-time updates.

## Collections Structure

Firestore uses "collections" (like tables) and "documents" (like rows):

```
users/                    (collection)
  ├── user1_uid/         (document)
  │   ├── name: "Alice"
  │   ├── budgetAdherence: 85
  │   └── ingredients: {...}
  └── user2_uid/         (document)
      └── ...

quizQuestions/            (collection)
  ├── question1/         (document)
  └── question2/         (document)
```

## Automatic Collection Creation

**You DON'T need to manually create collections!**

When your code writes data like:
```javascript
db.collection('users').doc(userId).set(userData);
```

Firestore automatically:
- Creates the `users` collection if it doesn't exist
- Creates the document with that ID
- Stores all the data

So when users sign up and data is saved, it will automatically appear in Firestore!

## Current vs Firestore

**Current (JSON file):**
- Data in `data.json`
- Only accessible on your server
- Simple file read/write

**With Firestore:**
- Data in Firebase cloud
- Accessible from anywhere
- Real-time updates
- Automatic scaling

## Next Steps

If you want to use Firestore, I can:
1. Update `server.js` to use Firestore
2. Migrate existing `data.json` data to Firestore
3. Keep JSON as fallback during migration

Let me know if you want to set up Firestore!

