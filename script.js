const firebaseConfig = {
    apiKey: "AIzaSyD16xj1IC0kkht2jvhMJSv8HVYfw3OKmXU",
    authDomain: "fir-ih-aff9a.firebaseapp.com",
    projectId: "fir-ih-aff9a",
    storageBucket: "fir-ih-aff9a.firebasestorage.app",
    messagingSenderId: "974043387070",
    appId: "1:974043387070:web:e1dd0974add5470638faef",
    measurementId: "G-XJWEYGNZ1N"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const adminLoginBtn = document.getElementById('admin-login-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const loginModal = document.getElementById('login-modal');
const adminAuthModal = document.getElementById('admin-auth-modal');

const heroSection = document.getElementById('hero-section');
const impactSection = document.getElementById('impact-section');
const reportFormSection = document.getElementById('report-form-section');
const adminPanel = document.getElementById('admin-panel');
const leaderboardSection = document.getElementById('leaderboard-section');

const reportForm = document.getElementById('report-form');
const imageUpload = document.getElementById('image-upload');
const fileNameDisplay = document.getElementById('file-name');
let aiCategory = document.getElementById('ai-category');
const aiDescription = document.getElementById('ai-description');
const locationInfo = document.getElementById('location-info');
const submitReportBtn = document.getElementById('submit-report-btn');
const formError = document.getElementById('form-error');

// Auth DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showLoginTabBtn = document.getElementById('show-login-tab');
const showRegisterTabBtn = document.getElementById('show-register-tab');

// Admin Auth Elements
const adminLoginForm = document.getElementById('admin-login-form');
const adminRegisterForm = document.getElementById('admin-register-form');
const showAdminLoginTabBtn = document.getElementById('show-admin-login-tab');
const showAdminRegisterTabBtn = document.getElementById('show-admin-register-tab');

// Admin Dashboard Elements
const complaintsListContainer = document.getElementById('complaints-list');
const refreshReportsBtn = document.getElementById('refresh-reports');
const statusFilter = document.getElementById('status-filter');
const categoryFilter = document.getElementById('category-filter');
const totalReportsSpan = document.getElementById('total-reports');
const pendingReportsSpan = document.getElementById('pending-reports');
const resolvedReportsSpan = document.getElementById('resolved-reports');

// Global Variables
let user = null;
let isAdmin = false;
let userLocation = null;    
let imageFile = null;
let allReports = [];

// Admin credentials (in production, this should be server-side)
const ADMIN_ACCESS_CODE = "CIVIC2024";

// Fake leaderboard data
const LEADERBOARD_DATA = [
    {
        name: "Rajesh Kumar",
        location: "Koramangala",
        reports: 247,
        points: 2470,
        badge: "gold",
        avatar: "RK"
    },
    {
        name: "Priya Sharma",
        location: "Indiranagar", 
        reports: 198,
        points: 2180,
        badge: "silver",
        avatar: "PS"
    },
    {
        name: "Amit Patel",
        location: "Whitefield",
        reports: 156,
        points: 1890,
        badge: "bronze",
        avatar: "AP"
    },
    {
        name: "Sneha Reddy",
        location: "Jayanagar",
        reports: 134,
        points: 1675,
        badge: "civic",
        avatar: "SR"
    },
    {
        name: "Vikram Singh",
        location: "HSR Layout",
        reports: 123,
        points: 1520,
        badge: "reporter",
        avatar: "VS"
    },
    {
        name: "Meera Nair",
        location: "Malleshwaram",
        reports: 98,
        points: 1285,
        badge: "reporter",
        avatar: "MN"
    },
    {
        name: "Rohit Gupta",
        location: "Banashankari",
        reports: 87,
        points: 1150,
        badge: "civic",
        avatar: "RG"
    },
    {
        name: "Kavya Krishnan",
        location: "Electronic City",
        reports: 76,
        points: 998,
        badge: "reporter",
        avatar: "KK"
    },
    {
        name: "Arjun Menon",
        location: "Marathahalli",
        reports: 65,
        points: 845,
        badge: "civic",
        avatar: "AM"
    },
    {
        name: "Deepika Joshi",
        location: "RT Nagar",
        reports: 54,
        points: 720,
        badge: "reporter",
        avatar: "DJ"
    }
];

// Comprehensive Civic Categories
const CIVIC_CATEGORIES = [
    'Pothole', 'Road Crack', 'Road Damage', 'Missing Road Sign', 'Broken Traffic Light', 'Damaged Speed Breaker',
    'Garbage Dump', 'Overflowing Bin', 'Littering', 'Illegal Dumping', 'Blocked Garbage Collection',
    'Water Leak', 'Blocked Drain', 'Flooding', 'Sewage Overflow', 'Broken Water Pipe', 'Stagnant Water',
    'Broken Streetlight', 'Damaged Bus Stop', 'Broken Bench', 'Damaged Footpath', 'Missing Manhole Cover', 'Broken Railing',
    'Fallen Tree', 'Overgrown Plants', 'Dead Tree', 'Damaged Park Equipment', 'Unmaintained Garden',
    'Unsafe Structure', 'Broken Glass', 'Open Construction Site', 'Damaged Playground', 'Unsafe Electrical Lines',
    'Stray Animals', 'Animal Carcass', 'Animal in Distress', 'Pest Infestation',
    'Noise Pollution', 'Air Pollution', 'Illegal Advertising', 'Graffiti', 'General Civic Issue'
];

// Detection patterns for different issue types
const DETECTION_PATTERNS = {
    'Animal Carcass': {
        keywords: ['dead', 'animal', 'carcass', 'roadkill', 'dog', 'cat', 'bird', 'died', 'corpse'],
        description: 'Dead animal requiring immediate removal - health and safety hazard'
    },
    'Pothole': {
        keywords: ['pothole', 'road', 'crack', 'asphalt', 'street', 'pavement'],
        description: 'Road surface damage requiring repair for vehicle safety'
    },
    'Garbage Dump': {
        keywords: ['garbage', 'trash', 'waste', 'dump', 'litter', 'rubbish', 'bin'],
        description: 'Waste accumulation requiring municipal cleanup services'
    },
    'Water Leak': {
        keywords: ['water', 'leak', 'pipe', 'burst', 'flood', 'wet'],
        description: 'Water infrastructure issue requiring immediate attention'
    },
    'Fallen Tree': {
        keywords: ['tree', 'fallen', 'branch', 'wood', 'plant', 'vegetation'],
        description: 'Fallen vegetation blocking path or causing safety hazard'
    },
    'Broken Streetlight': {
        keywords: ['light', 'streetlight', 'lamp', 'bulb', 'dark', 'lighting'],
        description: 'Non-functioning street lighting affecting public safety'
    },
    'Blocked Drain': {
        keywords: ['drain', 'sewer', 'blocked', 'clog', 'overflow', 'storm'],
        description: 'Drainage system obstruction causing water accumulation'
    },
    'Stray Animals': {
        keywords: ['stray', 'dogs', 'cats', 'animals', 'pets', 'roaming'],
        description: 'Stray animal issue requiring animal control intervention'
    }
};

// --- AUTHENTICATION LOGIC ---
auth.onAuthStateChanged((loggedInUser) => {
    user = loggedInUser;
    if (user) {
        // Check if user is admin (in production, this should be server-side verification)
        const adminEmails = ['admin@civicresolve.com', 'admin1@civicresolve.com', 'admin2@civicresolve.com'];
        isAdmin = adminEmails.includes(user.email) || user.displayName?.includes('[ADMIN]');
        
        if (isAdmin) {
            showAdminDashboard();
        } else {
            showUserDashboard();
        }
        
        hideAuthModals();
    } else {
        showPublicView();
    }
});

function showPublicView() {
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    adminLoginBtn.style.display = 'inline-block';
    adminLogoutBtn.style.display = 'none';
    
    heroSection.style.display = 'block';
    impactSection.style.display = 'block';
    leaderboardSection.style.display = 'block';
    reportFormSection.style.display = 'none';
    adminPanel.style.display = 'none';
}

function showUserDashboard() {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    adminLoginBtn.style.display = 'inline-block';
    adminLogoutBtn.style.display = 'none';
    
    heroSection.style.display = 'none';
    impactSection.style.display = 'block';
    leaderboardSection.style.display = 'block';
    reportFormSection.style.display = 'block';
    adminPanel.style.display = 'none';
    
    setupCategoryDropdown();
}

function showAdminDashboard() {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'none';
    adminLoginBtn.style.display = 'none';
    adminLogoutBtn.style.display = 'inline-block';
    
    heroSection.style.display = 'none';
    impactSection.style.display = 'none';
    leaderboardSection.style.display = 'block';
    reportFormSection.style.display = 'none';
    adminPanel.style.display = 'block';
    
    loadAdminData();
}

function hideAuthModals() {
    loginModal.style.display = 'none';
    adminAuthModal.style.display = 'none';
}

// --- USER AUTHENTICATION ---
loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex';
    showLoginTabBtn.click();
    clearAuthForms();
});

logoutBtn.addEventListener('click', () => {
    auth.signOut();
    alert('Logged out successfully!');
});

// --- ADMIN AUTHENTICATION ---
adminLoginBtn.addEventListener('click', () => {
    adminAuthModal.style.display = 'flex';
    showAdminLoginTabBtn.click();
    clearAdminAuthForms();
});

adminLogoutBtn.addEventListener('click', () => {
    auth.signOut();
    alert('Admin logged out successfully!');
});

// --- MODAL CONTROLS ---
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.closest('.modal-overlay').style.display = 'none';
    });
});

// --- AUTH TAB SWITCHING ---
showLoginTabBtn.addEventListener('click', () => switchAuthTab('login'));
showRegisterTabBtn.addEventListener('click', () => switchAuthTab('register'));
showAdminLoginTabBtn.addEventListener('click', () => switchAdminAuthTab('login'));
showAdminRegisterTabBtn.addEventListener('click', () => switchAdminAuthTab('register'));

function switchAuthTab(tab) {
    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        showLoginTabBtn.classList.add('active');
        showRegisterTabBtn.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        showLoginTabBtn.classList.remove('active');
        showRegisterTabBtn.classList.add('active');
    }
}

function switchAdminAuthTab(tab) {
    if (tab === 'login') {
        adminLoginForm.style.display = 'block';
        adminRegisterForm.style.display = 'none';
        showAdminLoginTabBtn.classList.add('active');
        showAdminRegisterTabBtn.classList.remove('active');
    } else {
        adminLoginForm.style.display = 'none';
        adminRegisterForm.style.display = 'block';
        showAdminLoginTabBtn.classList.remove('active');
        showAdminRegisterTabBtn.classList.add('active');
    }
}

function clearAuthForms() {
    loginForm.reset();
    registerForm.reset();
    document.getElementById('login-error').textContent = '';
    document.getElementById('register-error').textContent = '';
}

function clearAdminAuthForms() {
    adminLoginForm.reset();
    adminRegisterForm.reset();
    document.getElementById('admin-login-error').textContent = '';
    document.getElementById('admin-register-error').textContent = '';
}

// --- USER REGISTRATION & LOGIN ---
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const registerError = document.getElementById('register-error');
    registerError.textContent = '';
    const registerButton = registerForm.querySelector('button');
    registerButton.disabled = true;
    registerButton.innerHTML = 'Registering... <span class="loader"></span>';

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(
            document.getElementById('register-email').value,
            document.getElementById('register-password').value
        );
        await userCredential.user.updateProfile({ 
            displayName: document.getElementById('register-name').value 
        });
        alert(`Welcome, ${document.getElementById('register-name').value}! Your account has been created.`);
    } catch (error) {
        console.error('Registration Error:', error.message);
        registerError.textContent = error.message;
    } finally {
        registerButton.disabled = false;
        registerButton.innerHTML = 'Register <i class="fas fa-user-plus"></i>';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const loginError = document.getElementById('login-error');
    loginError.textContent = '';
    const loginButton = loginForm.querySelector('button');
    loginButton.disabled = true;
    loginButton.innerHTML = 'Logging In... <span class="loader"></span>';

    try {
        await auth.signInWithEmailAndPassword(
            document.getElementById('login-email').value,
            document.getElementById('login-password').value
        );
    } catch (error) {
        console.error('Login Error:', error.message);
        loginError.textContent = error.message;
    } finally {
        loginButton.disabled = false;
        loginButton.innerHTML = 'Login <i class="fas fa-sign-in-alt"></i>';
    }
});

// --- ADMIN REGISTRATION & LOGIN ---
adminRegisterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const adminRegisterError = document.getElementById('admin-register-error');
    adminRegisterError.textContent = '';
    const registerButton = adminRegisterForm.querySelector('button');
    registerButton.disabled = true;
    registerButton.innerHTML = 'Creating Account... <span class="loader"></span>';

    try {
        const accessCode = document.getElementById('admin-code').value;
        if (accessCode !== ADMIN_ACCESS_CODE) {
            throw new Error('Invalid admin access code');
        }

        const userCredential = await auth.createUserWithEmailAndPassword(
            document.getElementById('admin-register-email').value,
            document.getElementById('admin-register-password').value
        );
        
        await userCredential.user.updateProfile({ 
            displayName: `[ADMIN] ${document.getElementById('admin-register-name').value}` 
        });
        
        alert(`Admin account created successfully!`);
    } catch (error) {
        console.error('Admin Registration Error:', error.message);
        adminRegisterError.textContent = error.message;
    } finally {
        registerButton.disabled = false;
        registerButton.innerHTML = 'Create Admin Account <i class="fas fa-user-plus"></i>';
    }
});

adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const adminLoginError = document.getElementById('admin-login-error');
    adminLoginError.textContent = '';
    const loginButton = adminLoginForm.querySelector('button');
    loginButton.disabled = true;
    loginButton.innerHTML = 'Logging In... <span class="loader"></span>';

    try {
        await auth.signInWithEmailAndPassword(
            document.getElementById('admin-login-email').value,
            document.getElementById('admin-login-password').value
        );
    } catch (error) {
        console.error('Admin Login Error:', error.message);
        adminLoginError.textContent = error.message;
    } finally {
        loginButton.disabled = false;
        loginButton.innerHTML = 'Admin Login <i class="fas fa-sign-in-alt"></i>';
    }
});

// --- CATEGORY DROPDOWN SETUP ---
function setupCategoryDropdown() {
    if (aiCategory && aiCategory.tagName !== 'SELECT') {
        const categorySelect = document.createElement('select');
        categorySelect.id = 'ai-category';
        categorySelect.className = aiCategory.className;
        categorySelect.style.cssText = aiCategory.style.cssText;
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select Category';
        categorySelect.appendChild(defaultOption);
        
        const categoryGroups = {
            'Roads & Transportation': ['Pothole', 'Road Crack', 'Road Damage', 'Missing Road Sign', 'Broken Traffic Light', 'Damaged Speed Breaker'],
            'Waste Management': ['Garbage Dump', 'Overflowing Bin', 'Littering', 'Illegal Dumping', 'Blocked Garbage Collection'],
            'Water & Drainage': ['Water Leak', 'Blocked Drain', 'Flooding', 'Sewage Overflow', 'Broken Water Pipe', 'Stagnant Water'],
            'Public Infrastructure': ['Broken Streetlight', 'Damaged Bus Stop', 'Broken Bench', 'Damaged Footpath', 'Missing Manhole Cover', 'Broken Railing'],
            'Parks & Vegetation': ['Fallen Tree', 'Overgrown Plants', 'Dead Tree', 'Damaged Park Equipment', 'Unmaintained Garden'],
            'Public Safety': ['Unsafe Structure', 'Broken Glass', 'Open Construction Site', 'Damaged Playground', 'Unsafe Electrical Lines'],
            'Animal Issues': ['Stray Animals', 'Animal Carcass', 'Animal in Distress', 'Pest Infestation'],
            'Other Issues': ['Noise Pollution', 'Air Pollution', 'Illegal Advertising', 'Graffiti', 'General Civic Issue']
        };
        
        Object.entries(categoryGroups).forEach(([groupName, categories]) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = groupName;
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                optgroup.appendChild(option);
            });
            
            categorySelect.appendChild(optgroup);
        });
        
        aiCategory.parentNode.replaceChild(categorySelect, aiCategory);
        aiCategory = categorySelect;
        
        categorySelect.addEventListener('change', (e) => {
            if (e.target.value) {
                updateDescriptionForCategory(e.target.value);
            }
        });
    }
}

function updateDescriptionForCategory(category) {
    const pattern = DETECTION_PATTERNS[category];
    if (pattern) {
        aiDescription.value = pattern.description + ' (User selected)';
    } else {
        aiDescription.value = `${category} reported by citizen requiring municipal attention (User selected)`;
    }
}

// --- CIVIC ISSUE DETECTION ---
function detectCivicIssueFromFilename(filename) {
    const name = filename.toLowerCase();
    
    for (const [category, pattern] of Object.entries(DETECTION_PATTERNS)) {
        for (const keyword of pattern.keywords) {
            if (name.includes(keyword)) {
                return {
                    category: category,
                    confidence: 0.85,
                    description: pattern.description + ' (Detected from filename)',
                    method: 'filename'
                };
            }
        }
    }
    
    return null;
}

function getSmartCivicSuggestion() {
    const currentHour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    const timeBasedSuggestions = {
        morning: ['Garbage Dump', 'Pothole', 'Road Damage', 'Water Leak'],
        afternoon: ['Broken Streetlight', 'Damaged Footpath', 'Missing Manhole Cover', 'Unsafe Structure'],
        evening: ['Broken Streetlight', 'Unsafe Structure', 'Stray Animals', 'General Civic Issue'],
        night: ['Broken Streetlight', 'Unsafe Structure', 'General Civic Issue', 'Animal Carcass']
    };
    
    let suggestionPool = [];
    
    if (currentHour >= 6 && currentHour < 12) {
        suggestionPool = timeBasedSuggestions.morning;
    } else if (currentHour >= 12 && currentHour < 17) {
        suggestionPool = timeBasedSuggestions.afternoon;
    } else if (currentHour >= 17 && currentHour < 21) {
        suggestionPool = timeBasedSuggestions.evening;
    } else {
        suggestionPool = timeBasedSuggestions.night;
    }
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        suggestionPool.push('Overgrown Plants', 'Damaged Park Equipment', 'Littering');
    }
    
    const randomCategory = suggestionPool[Math.floor(Math.random() * suggestionPool.length)];
    const pattern = DETECTION_PATTERNS[randomCategory];
    
    return {
        category: randomCategory,
        confidence: 0.4,
        description: (pattern ? pattern.description : `${randomCategory} requiring municipal attention`) + ' (Smart suggestion)',
        method: 'smart'
    };
}

async function detectCivicIssue(imageFile) {
    try {
        const filenameResult = detectCivicIssueFromFilename(imageFile.name);
        if (filenameResult) {
            return filenameResult;
        }
        
        const fileAnalysis = analyzeFileProperties(imageFile);
        if (fileAnalysis) {
            return fileAnalysis;
        }
        
        return getSmartCivicSuggestion();
        
    } catch (error) {
        console.error('Detection failed:', error);
        return {
            category: 'General Civic Issue',
            confidence: 0.3,
            description: 'Civic issue requiring manual classification',
            method: 'fallback'
        };
    }
}

function analyzeFileProperties(file) {
    const size = file.size;
    const name = file.name.toLowerCase();
    
    if (size > 5000000) {
        return {
            category: 'General Civic Issue',
            confidence: 0.5,
            description: 'Complex civic issue detected - requires detailed review',
            method: 'filesize'
        };
    }
    
    if (size < 100000) {
        return {
            category: 'Road Damage',
            confidence: 0.4,
            description: 'Simple infrastructure issue detected',
            method: 'filesize'
        };
    }
    
    if (name.includes('img') || name.includes('photo') || name.includes('pic')) {
        return {
            category: 'General Civic Issue',
            confidence: 0.35,
            description: 'Civic issue captured in photo format',
            method: 'filetype'
        };
    }
    
    return null;
}

// --- LOCATION HANDLING ---
async function getLocationPromise() {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            const timeoutId = setTimeout(() => {
                console.log('Geolocation timeout');
                setDefaultLocation();
                resolve();
            }, 5000);
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(timeoutId);
                    userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        address: 'Near BBMP Office, Bangalore'
                    };
                    locationInfo.innerHTML = `<i class="fas fa-map-marker-alt"></i> Location: ${userLocation.address} (${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)})`;
                    resolve();
                },
                (err) => {
                    clearTimeout(timeoutId);
                    console.error('Geolocation Error:', err);
                    setDefaultLocation();
                    resolve();
                }
            );
        } else {
            setDefaultLocation();
            resolve();
        }
    });
}

function setDefaultLocation() {
    userLocation = { 
        latitude: 12.9716, 
        longitude: 77.5946, 
        address: 'Default: Bangalore City Center' 
    };
    locationInfo.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${userLocation.address} (Default)`;
}

// --- IMAGE UPLOAD HANDLER ---
imageUpload.addEventListener('change', (e) => {
    imageFile = e.target.files[0];
    if (imageFile) {
        if (imageFile.size > 10 * 1024 * 1024) {
            fileNameDisplay.textContent = 'File too large (max 10MB)';
            fileNameDisplay.style.color = '#ef4444';
            submitReportBtn.disabled = true;
            return;
        }
        
        if (!imageFile.type.startsWith('image/')) {
            fileNameDisplay.textContent = 'Please select an image file';
            fileNameDisplay.style.color = '#ef4444';
            submitReportBtn.disabled = true;
            return;
        }
        
        fileNameDisplay.textContent = `Selected: ${imageFile.name}`;
        fileNameDisplay.style.color = '#22c55e';
        
        simulateAIandGeo();
    } else {
        fileNameDisplay.textContent = '';
        submitReportBtn.disabled = true;
    }
});

// --- MAIN DETECTION FUNCTION ---
async function simulateAIandGeo() {
    setupCategoryDropdown();
    
    aiCategory.value = '';
    aiDescription.value = 'Analyzing image and location...';
    locationInfo.innerHTML = '<i class="fas fa-map-marker-alt"></i> Fetching location...';
    submitReportBtn.disabled = true;
    formError.textContent = '';

    try {
        const overallTimeout = setTimeout(() => {
            console.log('Overall process timeout');
            handleDetectionComplete({
                category: 'General Civic Issue',
                confidence: 0.3,
                description: 'Detection timeout - please select appropriate category',
                method: 'timeout'
            });
        }, 10000);

        await getLocationPromise();
        const detectionResult = await detectCivicIssue(imageFile);
        
        clearTimeout(overallTimeout);
        handleDetectionComplete(detectionResult);
        
    } catch (error) {
        console.error('Detection process failed:', error);
        handleDetectionComplete({
            category: 'General Civic Issue',
            confidence: 0.3,
            description: 'Detection failed - please select appropriate category manually',
            method: 'error'
        });
    }
}

function handleDetectionComplete(result) {
    aiCategory.value = result.category;
    aiDescription.value = result.description;
    submitReportBtn.disabled = false;
    
    const confidenceColor = result.confidence > 0.7 ? '#22c55e' : 
                           result.confidence > 0.5 ? '#f59e0b' : '#6b7280';
    
    formError.textContent = `Detection: ${result.category} (${Math.round(result.confidence * 100)}% confidence, ${result.method})`;
    formError.style.color = confidenceColor;
    
    console.log('Detection completed:', result);
}

// --- REPORT SUBMISSION ---
reportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!user || !userLocation || !imageFile || !aiCategory.value) {
        formError.textContent = 'Please complete all fields.';
        formError.style.color = '#ef4444';
        return;
    }

    submitReportBtn.disabled = true;
    submitReportBtn.innerHTML = 'Submitting <span class="loader"></span>';

    const mockImageUrl = 'https://via.placeholder.com/400';
    const reportData = {
        description: aiDescription.value,
        category: aiCategory.value,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        address: userLocation.address,
        imageUrl: mockImageUrl,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Anonymous User',
        timestamp: new Date().toISOString(),
        fileName: imageFile.name,
        fileSize: imageFile.size,
        status: 'pending'
    };

    try {
        // Simulate API call (replace with actual API endpoint)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate fake ID
        const reportId = 'RPT' + Date.now().toString(36).toUpperCase();
        
        alert(`Report submitted successfully! Your report ID is ${reportId}`);

        // Reset form
        reportForm.reset();
        fileNameDisplay.textContent = '';
        locationInfo.innerHTML = '<i class="fas fa-map-marker-alt"></i> Location will be detected when you upload an image';
        aiCategory.value = '';
        aiDescription.value = '';
        formError.textContent = '';
        imageFile = null;

    } catch (error) {
        console.error('Submission Error:', error);
        formError.textContent = 'Failed to submit report. Please check your connection and try again.';
        formError.style.color = '#ef4444';
    } finally {
        submitReportBtn.disabled = false;
        submitReportBtn.innerHTML = 'Submit Report <i class="fas fa-paper-plane"></i>';
    }
});

// --- ADMIN DASHBOARD FUNCTIONS ---
function loadAdminData() {
    loadReports();
    setupAdminEventListeners();
    generateLeaderboard();
}

function setupAdminEventListeners() {
    refreshReportsBtn?.addEventListener('click', loadReports);
    statusFilter?.addEventListener('change', filterReports);
    categoryFilter?.addEventListener('change', filterReports);
}

async function loadReports() {
    if (complaintsListContainer) {
        complaintsListContainer.innerHTML = '<div class="loading-placeholder"><i class="fas fa-spinner fa-spin"></i> Loading reports...</div>';
    }
    
    try {
        // Simulate loading reports (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate fake reports data
        allReports = generateFakeReports();
        displayReports(allReports);
        updateAdminStats(allReports);
        
    } catch (error) {
        console.error('Failed to load reports:', error);
        if (complaintsListContainer) {
            complaintsListContainer.innerHTML = '<div class="loading-placeholder" style="color: #ef4444;"><i class="fas fa-exclamation-triangle"></i> Failed to load reports</div>';
        }
    }
}

function generateFakeReports() {
    const reports = [];
    const categories = ['Pothole', 'Garbage Dump', 'Water Leak', 'Broken Streetlight', 'Fallen Tree', 'Stray Animals'];
    const locations = ['Koramangala', 'Indiranagar', 'Whitefield', 'Jayanagar', 'HSR Layout', 'Malleshwaram'];
    const statuses = ['pending', 'in-progress', 'resolved'];
    const users = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh', 'Meera Nair'];
    
    for (let i = 0; i < 25; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        const daysAgo = Math.floor(Math.random() * 30);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        reports.push({
            id: `RPT${Date.now().toString(36).toUpperCase()}${i}`,
            category: category,
            description: `${category} reported in ${location} area. ${DETECTION_PATTERNS[category]?.description || 'Requires municipal attention.'}`,
            location: location,
            latitude: 12.9716 + (Math.random() - 0.5) * 0.1,
            longitude: 77.5946 + (Math.random() - 0.5) * 0.1,
            userName: user,
            userEmail: `${user.toLowerCase().replace(' ', '.')}@email.com`,
            status: status,
            timestamp: date.toISOString(),
            imageUrl: 'https://via.placeholder.com/300x200',
            priority: Math.random() > 0.7 ? 'high' : 'normal'
        });
    }
    
    return reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function displayReports(reports) {
    if (!complaintsListContainer) return;
    
    if (reports.length === 0) {
        complaintsListContainer.innerHTML = '<div class="loading-placeholder">No reports found matching the current filters.</div>';
        return;
    }
    
    const reportsHtml = reports.map(report => `
        <div class="complaint-card" data-status="${report.status}" data-category="${report.category}">
            <div class="complaint-header">
                <div class="complaint-info">
                    <div class="complaint-id">ID: ${report.id}</div>
                    <div class="complaint-category">${report.category}</div>
                    <div class="complaint-description">${report.description}</div>
                </div>
                <div class="complaint-actions">
                    <span class="status-badge status-${report.status}">${report.status.replace('-', ' ')}</span>
                    ${report.priority === 'high' ? '<span class="status-badge" style="background: #fecaca; color: #991b1b;">HIGH PRIORITY</span>' : ''}
                </div>
            </div>
            <div class="complaint-meta">
                <span><i class="fas fa-user"></i> ${report.userName}</span>
                <span><i class="fas fa-envelope"></i> ${report.userEmail}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${report.location}</span>
                <span><i class="fas fa-clock"></i> ${formatDate(report.timestamp)}</span>
            </div>
            <div class="complaint-actions">
                ${report.status === 'pending' ? `
                    <button class="btn btn-small btn-primary" onclick="updateReportStatus('${report.id}', 'in-progress')">
                        <i class="fas fa-play"></i> Start Work
                    </button>
                ` : ''}
                ${report.status === 'in-progress' ? `
                    <button class="btn btn-small btn-success" onclick="updateReportStatus('${report.id}', 'resolved')">
                        <i class="fas fa-check"></i> Mark Resolved
                    </button>
                ` : ''}
                <button class="btn btn-small" onclick="viewReportDetails('${report.id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteReport('${report.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
    
    complaintsListContainer.innerHTML = reportsHtml;
}

function updateAdminStats(reports) {
    if (totalReportsSpan) totalReportsSpan.textContent = reports.length;
    if (pendingReportsSpan) pendingReportsSpan.textContent = reports.filter(r => r.status === 'pending').length;
    if (resolvedReportsSpan) resolvedReportsSpan.textContent = reports.filter(r => r.status === 'resolved').length;
}

function filterReports() {
    if (!allReports) return;
    
    const statusFilterValue = statusFilter?.value || 'all';
    const categoryFilterValue = categoryFilter?.value || 'all';
    
    let filteredReports = allReports;
    
    if (statusFilterValue !== 'all') {
        filteredReports = filteredReports.filter(report => report.status === statusFilterValue);
    }
    
    if (categoryFilterValue !== 'all') {
        filteredReports = filteredReports.filter(report => report.category === categoryFilterValue);
    }
    
    displayReports(filteredReports);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

// --- ADMIN ACTIONS ---
function updateReportStatus(reportId, newStatus) {
    const report = allReports.find(r => r.id === reportId);
    if (report) {
        report.status = newStatus;
        displayReports(getFilteredReports());
        updateAdminStats(allReports);
        
        const statusText = newStatus.replace('-', ' ');
        alert(`Report ${reportId} status updated to: ${statusText}`);
    }
}

function viewReportDetails(reportId) {
    const report = allReports.find(r => r.id === reportId);
    if (report) {
        const details = `
Report Details:
━━━━━━━━━━━━━━━━━━━━
ID: ${report.id}
Category: ${report.category}
Description: ${report.description}
Location: ${report.location}
Coordinates: ${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}
Reported by: ${report.userName} (${report.userEmail})
Status: ${report.status.replace('-', ' ').toUpperCase()}
Date: ${new Date(report.timestamp).toLocaleString()}
Priority: ${report.priority.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━
        `;
        alert(details);
    }
}

function deleteReport(reportId) {
    if (confirm(`Are you sure you want to delete report ${reportId}? This action cannot be undone.`)) {
        allReports = allReports.filter(r => r.id !== reportId);
        displayReports(getFilteredReports());
        updateAdminStats(allReports);
        alert(`Report ${reportId} has been deleted.`);
    }
}

function getFilteredReports() {
    const statusFilterValue = statusFilter?.value || 'all';
    const categoryFilterValue = categoryFilter?.value || 'all';
    
    let filteredReports = allReports;
    
    if (statusFilterValue !== 'all') {
        filteredReports = filteredReports.filter(report => report.status === statusFilterValue);
    }
    
    if (categoryFilterValue !== 'all') {
        filteredReports = filteredReports.filter(report => report.category === categoryFilterValue);
    }
    
    return filteredReports;
}

// --- LEADERBOARD FUNCTIONS ---
function generateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) return;
    
    const leaderboardHtml = LEADERBOARD_DATA.map((leader, index) => {
        const rank = index + 1;
        const badgeClass = `badge-${leader.badge}`;
        const badgeText = leader.badge.charAt(0).toUpperCase() + leader.badge.slice(1);
        
        return `
            <div class="leaderboard-item">
                <div class="rank ${rank <= 3 ? 'top-3' : ''}">#${rank}</div>
                <div class="citizen-info">
                    <div class="avatar">${leader.avatar}</div>
                    <div>
                        <div class="citizen-name">${leader.name}</div>
                        <div class="citizen-location">${leader.location}</div>
                    </div>
                </div>
                <div class="reports-count">${leader.reports}</div>
                <div class="points">${leader.points}</div>
                <div class="badge ${badgeClass}">${badgeText}</div>
            </div>
        `;
    }).join('');
    
    leaderboardList.innerHTML = leaderboardHtml;
}

// --- INITIALIZE APP ---
document.addEventListener('DOMContentLoaded', () => {
    generateLeaderboard();
    
    // Initialize with public view
    showPublicView();
});

// Window click events for modals
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (e.target === adminAuthModal) {
        adminAuthModal.style.display = 'none';
    }
});

// Global functions for admin actions (needed for onclick handlers)
window.updateReportStatus = updateReportStatus;
window.viewReportDetails = viewReportDetails;
window.deleteReport = deleteReport;