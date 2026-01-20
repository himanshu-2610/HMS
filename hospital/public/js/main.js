// DOM Elements
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
loginBtn.addEventListener('click', showLoginForm);
registerBtn.addEventListener('click', showRegisterForm);

// Check authentication on page load
document.addEventListener('DOMContentLoaded', checkAuth);

// Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store the token and user data in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userId', data.user.id);
            
            // Redirect based on user role
            switch(data.user.role) {
                case 'admin':
                    window.location.href = '/admin/dashboard.html';
                    break;
                case 'doctor':
                    window.location.href = '/doctor/dashboard.html';
                    break;
                case 'patient':
                    window.location.href = '/patient/dashboard.html';
                    break;
                default:
                    showError('Invalid role');
            }
        } else {
            showError(data.message || 'Login failed');
        }
    } catch (error) {
        showError('An error occurred during login');
        console.error('Login error:', error);
    }
}

function showLoginForm() {
    // Implementation for showing login form
    console.log('Show login form');
}

function showRegisterForm() {
    // Implementation for showing registration form
    console.log('Show register form');
}

function showError(message) {
    // Create and show error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.textContent = message;
    
    const form = document.getElementById('loginForm');
    form.appendChild(errorDiv);
    
    // Remove error message after 3 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole) {
        // Redirect to appropriate dashboard
        switch(userRole) {
            case 'admin':
                window.location.href = '/admin/dashboard.html';
                break;
            case 'doctor':
                window.location.href = '/doctor/dashboard.html';
                break;
            case 'patient':
                window.location.href = '/patient/dashboard.html';
                break;
        }
    }
} 