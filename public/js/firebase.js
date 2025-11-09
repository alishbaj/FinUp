// Central Firebase Setup File
// This file handles all Firebase initialization and authentication

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCx9VMWVKrvrQLcjyecsk4x9euwq_dv7hE",
  authDomain: "budget-brew.firebaseapp.com",
  projectId: "budget-brew",
  storageBucket: "budget-brew.firebasestorage.app",
  messagingSenderId: "965067623333",
  appId: "1:965067623333:web:eb543d93a1fcb07ba0f64c",
  measurementId: "G-RP8KLR3ZJR"
};

// Initialize Firebase
let firebaseApp;
let firebaseAuth;

// Wait for Firebase SDK to load, then initialize
function initFirebase() {
  // Get Firebase SDK (could be on window or as module)
  const firebaseSDK = window.firebase || (typeof firebase !== 'undefined' ? firebase : null);
  
  if (!firebaseSDK) {
    console.warn('Firebase SDK not loaded yet');
    return false;
  }
  
  if (!firebaseSDK.initializeApp) {
    console.warn('Firebase initializeApp not available');
    return false;
  }
  
  try {
    // Check if already initialized
    const apps = firebaseSDK.apps || [];
    let appInitialized = false;
    
    if (apps.length === 0) {
      // Initialize with config
      console.log('Initializing Firebase with config:', firebaseConfig);
      firebaseApp = firebaseSDK.initializeApp(firebaseConfig);
      appInitialized = true;
    } else {
      // Already initialized
      firebaseApp = firebaseSDK.app();
      appInitialized = true;
    }
    
    if (!appInitialized) {
      console.error('Failed to initialize Firebase app');
      return false;
    }
    
    // Get auth - Firebase v8 auth module loads separately
    // The auth script should add methods to firebase object
    if (firebaseSDK.auth) {
      // Firebase v8: firebase.auth() returns the auth instance
      firebaseAuth = firebaseSDK.auth(firebaseApp);
      if (!firebaseAuth) {
        // Try without app parameter
        firebaseAuth = firebaseSDK.auth();
      }
    }
    
    if (!firebaseAuth) {
      console.error('Failed to get Firebase Auth instance');
      return false;
    }
    
    // Make available globally
    window.firebaseApp = firebaseApp;
    window.firebaseAuth = firebaseAuth;
    
    console.log('✅ Firebase initialized successfully');
    console.log('Firebase App:', firebaseApp);
    console.log('Firebase Auth:', firebaseAuth);
    return true;
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    console.error('Error details:', error.message, error.stack);
    return false;
  }
}

// Wait for page and Firebase SDK to fully load
function waitForFirebaseAndInit() {
  // Check if Firebase is loaded
  const firebaseSDK = window.firebase || (typeof firebase !== 'undefined' ? firebase : null);
  
  if (firebaseSDK && firebaseSDK.initializeApp) {
    // Firebase is loaded, initialize
    if (initFirebase()) {
      console.log('✅ Firebase initialized on first try');
    } else {
      console.warn('⚠️ Firebase initialization failed, will retry...');
      setTimeout(waitForFirebaseAndInit, 500);
    }
  } else {
    // Firebase not loaded yet, wait and retry
    setTimeout(waitForFirebaseAndInit, 200);
  }
}

// Start initialization process
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(waitForFirebaseAndInit, 500);
  });
} else {
  setTimeout(waitForFirebaseAndInit, 500);
}

// API Base URL (make it globally available)
// Use var instead of const to allow other scripts to access it
if (typeof window.API_BASE_URL === 'undefined') {
    window.API_BASE_URL = 'http://localhost:3000/api';
}
var API_BASE_URL = window.API_BASE_URL;

// ==================== Authentication Functions ====================

// Get current user's auth token
async function getAuthToken() {
  const auth = firebaseAuth || window.firebaseAuth;
  if (auth && auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }
  return null;
}

// Make authenticated API request
async function authenticatedFetch(url, options = {}) {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers
  });
}

// Helper to ensure Firebase is initialized
async function ensureFirebaseInitialized() {
  // Try to initialize if not already done
  if (!firebaseAuth && !window.firebaseAuth) {
    const initialized = initFirebase();
    if (!initialized) {
      // Wait a bit and retry
      await new Promise(resolve => setTimeout(resolve, 500));
      initFirebase();
    }
  }
  
  // Final check - get auth from Firebase SDK directly if needed
  if (!firebaseAuth && !window.firebaseAuth) {
    const firebaseSDK = window.firebase || (typeof firebase !== 'undefined' ? firebase : null);
    if (firebaseSDK) {
      // Make sure app is initialized first
      if (!firebaseApp && firebaseSDK.apps && firebaseSDK.apps.length === 0) {
        firebaseApp = firebaseSDK.initializeApp(firebaseConfig);
      } else if (!firebaseApp) {
        firebaseApp = firebaseSDK.app();
      }
      
      // Get auth
      if (firebaseSDK.auth && firebaseApp) {
        firebaseAuth = firebaseSDK.auth(firebaseApp);
        if (!firebaseAuth) {
          firebaseAuth = firebaseSDK.auth();
        }
        window.firebaseAuth = firebaseAuth;
      }
    }
  }
  
  return firebaseAuth || window.firebaseAuth;
}

// Sign up new user
async function signUp(email, password) {
  const auth = await ensureFirebaseInitialized();
  
  if (!auth) {
    console.error('Firebase Auth not available. Firebase SDK:', window.firebase);
    console.error('Firebase App:', firebaseApp);
    return { success: false, error: 'Firebase not initialized. Please refresh the page and try again.' };
  }
  
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Sign up error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return { success: false, error: error.message || 'Failed to create account' };
  }
}

// Sign in existing user
async function signIn(email, password) {
  const auth = await ensureFirebaseInitialized();
  
  if (!auth) {
    console.error('Firebase Auth not available. Firebase SDK:', window.firebase);
    console.error('Firebase App:', firebaseApp);
    return { success: false, error: 'Firebase not initialized. Please refresh the page and try again.' };
  }
  
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Sign in error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return { success: false, error: error.message || 'Failed to sign in' };
  }
}

// Sign out
async function signOut() {
  const auth = firebaseAuth || window.firebaseAuth;
  if (!auth) {
    return { success: false, error: 'Firebase not initialized' };
  }
  
  try {
    await auth.signOut();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get current user
function getCurrentUser() {
  const auth = firebaseAuth || window.firebaseAuth;
  if (auth) {
    return auth.currentUser;
  }
  return null;
}

// Check if user is authenticated
function isAuthenticated() {
  return getCurrentUser() !== null;
}

// Listen for auth state changes
function onAuthStateChanged(callback) {
  const auth = firebaseAuth || window.firebaseAuth;
  if (auth) {
    return auth.onAuthStateChanged(callback);
  }
  // Return a no-op function if Firebase not initialized
  return () => {};
}

// Get current user data from API
async function getCurrentUserData() {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/user/me`);
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Export for use in other scripts (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    firebaseApp,
    firebaseAuth,
    getAuthToken,
    authenticatedFetch,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    isAuthenticated,
    onAuthStateChanged,
    getCurrentUserData,
    API_BASE_URL
  };
}

