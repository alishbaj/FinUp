# Enable Email/Password Authentication in Firebase

## The Problem
You're getting `CONFIGURATION_NOT_FOUND` because Email/Password authentication isn't enabled in your Firebase project.

## Solution: Enable Email/Password Authentication

### Step 1: Go to Firebase Console
1. Open https://console.firebase.google.com/
2. Select your project: **budget-brew**

### Step 2: Navigate to Authentication
1. Click **"Authentication"** in the left sidebar
2. If you see a "Get started" button, click it

### Step 3: Enable Email/Password Sign-in
1. Click on the **"Sign-in method"** tab (at the top)
2. You'll see a list of sign-in providers
3. Find **"Email/Password"** in the list
4. Click on it
5. Toggle **"Enable"** to ON
6. Click **"Save"**

### Step 4: Verify
You should see "Email/Password" with a green checkmark indicating it's enabled.

## That's It!
Once enabled, try signing up again on your website. The error should be gone!

## Alternative: If Email/Password is Already Enabled
If it's already enabled, the issue might be:
1. **Wrong project**: Make sure you're using the correct Firebase project
2. **API restrictions**: Check if your API key has restrictions (should allow Firebase Auth API)
3. **Project settings**: Verify your `firebaseConfig` matches your Firebase project

## Quick Check
After enabling, refresh your website and try signing up again!

