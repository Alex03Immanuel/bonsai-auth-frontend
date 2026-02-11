// API Configuration
const API_BASE_URL = 'https://bonsai-auth-backend.onrender.com';

// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const requestOtpBtn = document.getElementById('requestOtpBtn');
const messageDiv = document.getElementById('message');
const dashboard = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logoutBtn');
const userEmailSpan = document.getElementById('userEmail');

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        
        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        
        // Clear messages
        hideMessage();
    });
});

// Show Message
function showMessage(text, type = 'info') {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideMessage();
    }, 5000);
}

// Hide Message
function hideMessage() {
    messageDiv.classList.add('hidden');
}

// Set Button Loading State
function setLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Register
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'error');
        return;
    }
    
    // Validate password strength
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters!', 'error');
        return;
    }
    
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    setLoading(submitBtn, true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Registration successful! You can now login.', 'success');
            registerForm.reset();
            
            // Switch to login tab
            setTimeout(() => {
                document.querySelector('[data-tab="login"]').click();
                document.getElementById('loginEmail').value = email;
            }, 1500);
        } else {
            showMessage(data.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
        showMessage('Connection error. Please check your internet.', 'error');
    } finally {
        setLoading(submitBtn, false);
    }
});

// Request OTP
requestOtpBtn.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value;
    
    if (!email) {
        showMessage('Please enter your email first!', 'error');
        return;
    }
    
    setLoading(requestOtpBtn, true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('OTP sent to your email! Check your inbox.', 'success');
            document.getElementById('loginOtp').focus();
        } else {
            showMessage(data.message || 'Failed to send OTP. Please try again.', 'error');
        }
    } catch (error) {
        console.error('OTP request error:', error);
        showMessage('Connection error. Please check your internet.', 'error');
    } finally {
        setLoading(requestOtpBtn, false);
    }
});

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const otp = document.getElementById('loginOtp').value;
    
    if (!otp) {
        showMessage('Please enter the OTP code!', 'error');
        return;
    }
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    setLoading(submitBtn, true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, otp }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Login successful!', 'success');
            
            // Store user session
            localStorage.setItem('user', JSON.stringify({ email }));
            
            // Show dashboard
            setTimeout(() => {
                showDashboard(email);
            }, 1000);
        } else {
            showMessage(data.message || 'Login failed. Check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Connection error. Please check your internet.', 'error');
    } finally {
        setLoading(submitBtn, false);
    }
});

// Show Dashboard
function showDashboard(email) {
    document.querySelector('.tabs').classList.add('hidden');
    tabContents.forEach(content => content.classList.add('hidden'));
    messageDiv.classList.add('hidden');
    
    userEmailSpan.textContent = email;
    dashboard.classList.remove('hidden');
}

// Hide Dashboard
function hideDashboard() {
    dashboard.classList.add('hidden');
    document.querySelector('.tabs').classList.remove('hidden');
    document.querySelector('[data-tab="login"]').click();
    
    // Clear forms
    loginForm.reset();
    registerForm.reset();
}

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    hideDashboard();
    showMessage('You have been logged out.', 'info');
});

// Check for existing session on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('user');
    if (user) {
        const { email } = JSON.parse(user);
        showDashboard(email);
    }
});