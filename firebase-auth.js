// Firebase Admin SDK Authentication Middleware
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

function initializeFirebase() {
    if (firebaseInitialized) {
        return;
    }

    try {
        // Try to load service account key
        const serviceAccountPath = path.join(__dirname, 'firebase-admin-key.json');
        
        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = require(serviceAccountPath);
            
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            
            firebaseInitialized = true;
            console.log('✅ Firebase Admin SDK initialized successfully');
        } else {
            console.warn('⚠️  Firebase Admin key not found. Authentication will be disabled.');
            console.warn('   To enable: Download service account key from Firebase Console');
            console.warn('   and save as firebase-admin-key.json in project root');
        }
    } catch (error) {
        console.error('❌ Error initializing Firebase Admin:', error.message);
        console.warn('   Authentication will be disabled');
    }
}

// Middleware to verify Firebase ID token
async function verifyToken(req, res, next) {
    // Skip authentication if Firebase not initialized
    if (!firebaseInitialized) {
        // For development: allow requests with userId in query/body
        req.userId = req.query.userId || req.body.userId || '1';
        return next();
    }

    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No authorization token provided' });
        }

        const idToken = authHeader.split('Bearer ')[1];
        
        // Verify the token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        // Add user info to request
        req.userId = decodedToken.uid;
        req.userEmail = decodedToken.email;
        
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// Optional: Middleware that allows either token or userId (for development)
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        // Use token authentication
        return verifyToken(req, res, next);
    } else {
        // Fallback to userId from query/body (development mode)
        req.userId = req.query.userId || req.body.userId || req.params.id || '1';
        next();
    }
}

// Get user by Firebase UID or create new user
async function getOrCreateUser(firebaseUid, email) {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(__dirname, 'data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    
    // Check if user exists with this Firebase UID
    let user = data.users.find(u => u.firebaseUid === firebaseUid);
    
    if (!user) {
        // Create new user
        const newUserId = (data.users.length + 1).toString();
        user = {
            id: newUserId,
            firebaseUid: firebaseUid,
            email: email,
            name: email ? email.split('@')[0] : 'User',
            budgetAdherence: 0,
            savingProgress: 0,
            investmentPerformance: 0,
            quizScore: 0,
            ingredients: {
                savings: 0,
                budget: 0,
                knowledge: 0,
                investment: 0
            },
            activePotions: [],
            activities: []
        };
        
        data.users.push(user);
        
        // Save to file
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
        
        console.log(`✅ Created new user: ${user.name} (${firebaseUid})`);
    }
    
    return user;
}

module.exports = {
    initializeFirebase,
    verifyToken,
    optionalAuth,
    getOrCreateUser,
    isInitialized: () => firebaseInitialized
};

