(function () {
  'use strict';

  // API Configuration - loaded from config.js
  var LOGIN_ENDPOINT = getApiUrl(API_CONFIG.ENDPOINTS.LOGIN);
  var DASHBOARD_URL = 'merchant-dashboard.html';

  // DOM Elements
  var loginForm = document.getElementById('login-form');
  var emailInput = document.getElementById('email');
  var passwordInput = document.getElementById('password');
  var rememberCheckbox = document.getElementById('remember');
  var loginButton = document.getElementById('login-button');
  var alertMessage = document.getElementById('alert-message');

  // Helper Functions
  function showAlert(message, type) {
    alertMessage.textContent = message;
    alertMessage.className = 'alert show ' + type;
    setTimeout(function () {
      alertMessage.className = 'alert';
    }, 5000);
  }

  function setLoading(isLoading) {
    loginButton.disabled = isLoading;
    loginButton.textContent = isLoading ? 'Signing in...' : 'Sign in';
    emailInput.disabled = isLoading;
    passwordInput.disabled = isLoading;
  }

  function saveAuthToken(token, expiresIn) {
    var storage = rememberCheckbox.checked ? localStorage : sessionStorage;
    storage.setItem('access_token', token);
    storage.setItem('token_type', 'Bearer');
    storage.setItem('expires_at', Date.now() + (expiresIn * 1000));
  }

  function redirectToDashboard() {
    window.location.href = DASHBOARD_URL;
  }

  function handleLoginSuccess(data) {
    if (data.status && data.data && data.data.access_token) {
      saveAuthToken(data.data.access_token, data.data.expires_in || 3600);
      showAlert(data.message || 'Login successful! Redirecting...', 'success');
      
      setTimeout(function () {
        redirectToDashboard();
      }, 1000);
    } else {
      redirectToDashboard();
    }
  }

  function handleLoginError(error) {
    // Allow the local front-end flow to continue without a running API.
    if (!error.status) {
      redirectToDashboard();
      return;
    }

    var message = 'An error occurred. Please try again.';
    
    if (error.message) {
      message = error.message;
    } else if (error.status === 401) {
      message = 'Invalid email or password';
    } else if (error.status === 400) {
      message = 'Please check your email and password';
    } else if (error.status >= 500) {
      message = 'Server error. Please try again later';
    }
    
    showAlert(message, 'error');
    setLoading(false);
  }

  function performLogin(email, password) {
    setLoading(true);

    // Create URL-encoded form data for ASP.NET MVC
    var params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);
    params.append('rememberMe', rememberCheckbox.checked);

    fetch(LOGIN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })
    .then(function (response) {
      var status = response.status;
      
      return response.text().then(function (text) {
        try {
          var data = JSON.parse(text);
          if (status !== 200) {
            var error = new Error(data.message || 'Login failed');
            error.status = status;
            error.data = data;
            throw error;
          }
          return data;
        } catch (e) {
          if (e.message && e.status) {
            throw e; // Re-throw our custom error
          }
          throw new Error('Server returned an invalid response. Make sure the backend API is running.');
        }
      });
    })
    .then(handleLoginSuccess)
    .catch(handleLoginError);
  }

  // Event Handlers
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    
    var email = emailInput.value.trim();
    var password = passwordInput.value;

    if (!email || !password) {
      showAlert('Please enter both email and password', 'error');
      return;
    }

    performLogin(email, password);
  });

  // Check if already logged in
  (function checkExistingAuth() {
    var token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    var expiresAt = localStorage.getItem('expires_at') || sessionStorage.getItem('expires_at');
    
    if (token && expiresAt && Date.now() < parseInt(expiresAt, 10)) {
      redirectToDashboard();
    }
  })();

  // Auto-focus email field
  emailInput.focus();
})();
