document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (localStorage.getItem('token') && !window.location.pathname.includes('auth')) {
      const role = localStorage.getItem('role');
      window.location.href = `../${role}/dashboard.html`;
    }
  
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
          const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('username', username);
            
            // Redirect to appropriate dashboard
            window.location.href = `../${data.role}/dashboard.html`;
          } else {
            showError(data.message || 'Login failed');
          }
        } catch (err) {
          console.error('Login error:', err);
          showError('An error occurred during login');
        }
      });
    }
  
    // Registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
          username: document.getElementById('username').value,
          password: document.getElementById('password').value,
          firstName: document.getElementById('firstName').value,
          lastName: document.getElementById('lastName').value,
          dob: document.getElementById('dob').value,
          gender: document.getElementById('gender').value,
          phone: document.getElementById('phone').value,
          emergencyContact: document.getElementById('emergencyContact').value,
          bloodType: document.getElementById('bloodType').value,
          allergies: document.getElementById('allergies').value
        };
        
        try {
          const response = await fetch('http://localhost:3000/api/auth/register/patient', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });
          
          const data = await response.json();
          
          if (response.ok) {
            showSuccess('Registration successful! Please login.');
            setTimeout(() => {
              window.location.href = '../auth/login.html';
            }, 2000);
          } else {
            showError(data.message || 'Registration failed');
          }
        } catch (err) {
          console.error('Registration error:', err);
          showError('An error occurred during registration');
        }
      });
    }
  
    // Logout functionality
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        window.location.href = '../auth/login.html';
      });
    });
  });
  
  function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      
      // Hide success message if visible
      const successDiv = document.getElementById('success-message');
      if (successDiv) successDiv.style.display = 'none';
    }
  }
  
  function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
      successDiv.textContent = message;
      successDiv.style.display = 'block';
      
      // Hide error message if visible
      const errorDiv = document.getElementById('error-message');
      if (errorDiv) errorDiv.style.display = 'none';
    }
  }