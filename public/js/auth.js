// Authentication helper functions for frontend

const API_BASE_URL = 'http://localhost:3000/api';

// Get current user's auth token
async function getAuthToken() {
    if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
        try {
            return await firebase.auth().currentUser.getIdToken();
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

// Sign up new user
async function signUp(email, password) {
    try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign in existing user
async function signIn(email, password) {
    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign out
async function signOut() {
    try {
        await firebase.auth().signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Get current user
function getCurrentUser() {
    if (typeof firebase !== 'undefined') {
        return firebase.auth().currentUser;
    }
    return null;
}

// Check if user is authenticated
function isAuthenticated() {
    return getCurrentUser() !== null;
}

// Listen for auth state changes
function onAuthStateChanged(callback) {
    if (typeof firebase !== 'undefined') {
        return firebase.auth().onAuthStateChanged(callback);
    }
    return () => {};
}

// Example: Get user data with authentication
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

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getAuthToken,
        authenticatedFetch,
        signUp,
        signIn,
        signOut,
        getCurrentUser,
        isAuthenticated,
        onAuthStateChanged,
        getCurrentUserData
    };
}

