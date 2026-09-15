(function () {
  'use strict';

  // API Configuration - loaded from config.js
  var REGISTER_ENDPOINT = getApiUrl(API_CONFIG.ENDPOINTS.REGISTER);
  var VERIFICATION_URL = 'email-verification.html';

  // Shared with login.js and business-activation.js. Once a merchant
  // registers, they need to complete business activation before their
  // first dashboard visit. This is a front-end nudge only — nothing
  // stops someone from typing merchant-dashboard.html directly, since
  // there's no backend check yet. A real gate would need the backend
  // to reject dashboard requests for unactivated merchants.
  var PENDING_ACTIVATION_KEY = 'pending_business_activation';

  function markActivationPending() {
    try { window.localStorage.setItem(PENDING_ACTIVATION_KEY, 'true'); }
    catch (e) { /* storage may be unavailable (e.g. private mode) */ }
  }

  // DOM Elements
  var registerForm = document.getElementById('register-form');
  var businessNameInput = document.getElementById('business-name');
  var contactEmailInput = document.getElementById('contact-email');
  var contactPhoneInput = document.getElementById('contact-phone');
  var passwordInput = document.getElementById('password');
  var confirmPasswordInput = document.getElementById('confirm-password');
  var termsCheckbox = document.getElementById('terms');
  var registerButton = document.getElementById('register-button');
  var alertMessage = document.getElementById('alert-message');

  // Helper Functions
  function showAlert(message, type) {
    alertMessage.textContent = message;
    alertMessage.className = 'alert show ' + type;
    alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(function () {
      alertMessage.className = 'alert';
    }, 8000);
  }

  function setLoading(isLoading) {
    registerButton.disabled = isLoading;
    registerButton.textContent = isLoading ? 'Creating Account...' : 'Create Account';
    
    var inputs = registerForm.querySelectorAll('input, select, button');
    inputs.forEach(function (input) {
      input.disabled = isLoading;
    });
  }

  function validateForm() {
    // Validate name (basic check)
    const nameValue = businessNameInput.value.trim();
    const namePattern = /^[A-Za-z\s'-]{2,50}$/;

    if (!namePattern.test(nameValue)) {
      showAlert('Please enter a valid name', 'error');
      return false;
    }

    // Validate email (basic check)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(contactEmailInput.value.trim())) {
      showAlert('Please enter a valid email address', 'error');
      return false;
    }

    // Validate phone number (basic check)
    if (contactPhoneInput.value.length < 10) {
      showAlert('Please enter a valid phone number', 'error');
      return false;
    }

    // Check if passwords match
    if (passwordInput.value !== confirmPasswordInput.value) {
      showAlert('Passwords do not match', 'error');
      return false;
    }

    // Validate password strength
    if (passwordInput.value.length < 8) {
      showAlert('Password must be at least 8 characters long', 'error');
      return false;
    }

    // Check terms
    if (!termsCheckbox.checked) {
      showAlert('You must agree to the Terms of Service and Privacy Policy', 'error');
      return false;
    }

    return true;
  }

  function handleRegistrationSuccess(data) {
    sessionStorage.setItem('verification_email', contactEmailInput.value.trim());
    markActivationPending();
    showAlert(
      data.message || 'Account created successfully! Check your email for a verification code.',
      'success'
    );
    
    setTimeout(function () {
      window.location.href = VERIFICATION_URL;
    }, 2000);
  }

  function continueToEmailVerification() {
    sessionStorage.setItem('verification_email', contactEmailInput.value.trim());
    markActivationPending();
    window.location.href = VERIFICATION_URL;
  }

  function handleRegistrationError(error) {
    // Continue through the local flow when the API is unavailable.
    if (!error.status) {
      continueToEmailVerification();
      return;
    }

    var message = 'Registration failed. Please try again.';
    
    console.error('Registration error:', error); // Debug logging
    
    if (error.message) {
      message = error.message;
    } else if (error.status === 409) {
      message = 'An account with this email already exists';
    } else if (error.status === 400) {
      message = 'Please check your information and try again';
    } else if (error.status >= 500) {
      message = 'Server error. Please try again later';
    }
    
    showAlert(message, 'error');
    setLoading(false);
  }

  function performRegistration(formData) {
    setLoading(true);

    // Create URL-encoded form data for ASP.NET MVC
    var params = new URLSearchParams();
    params.append('businessName', formData.businessName);
    params.append('contactEmail', formData.contactEmail);
    params.append('contactPhone', formData.contactPhone);
    params.append('password', formData.password);

    console.log('Submitting to:', REGISTER_ENDPOINT); // Debug logging

    fetch(REGISTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })
    .then(function (response) {
      console.log('Response status:', response.status); // Debug logging
      console.log('Response headers:', response.headers.get('content-type')); // Debug logging
      
      var status = response.status;
      
      // Always try to parse as JSON from our ASP.NET endpoint
      return response.text().then(function (text) {
        console.log('Response text:', text); // Debug logging
        
        try {
          var data = JSON.parse(text);
          if (status !== 201 && status !== 200) {
            var error = new Error(data.message || 'Registration failed');
            error.status = status;
            error.data = data;
            throw error;
          }
          return data;
        } catch (e) {
          if (e.message && e.status) {
            throw e; // Re-throw our custom error
          }
          console.error('JSON parse error:', e);
          console.error('Response was:', text.substring(0, 500));
          throw new Error('Server returned an invalid response. Make sure the backend API is running.');
        }
      });
    })
    .then(handleRegistrationSuccess)
    .catch(handleRegistrationError);
  }

  // Event Handlers
  registerForm.addEventListener('submit', function (event) {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    var formData = {
      businessName: businessNameInput.value.trim(),
      contactEmail: contactEmailInput.value.trim(),
      contactPhone: contactPhoneInput.value.trim(),
      password: passwordInput.value,
      isActive: true
    };

    performRegistration(formData);
  });

  // Phone number formatting
  contactPhoneInput.addEventListener('input', function () {
    // Basic phone number cleanup (remove non-numeric except +)
    var cleaned = this.value.replace(/[^\d+]/g, '');
    this.value = cleaned;
  });

  // Password strength indicator (optional enhancement)
  passwordInput.addEventListener('input', function () {
    if (confirmPasswordInput.value && this.value !== confirmPasswordInput.value) {
      confirmPasswordInput.setCustomValidity('Passwords do not match');
    } else {
      confirmPasswordInput.setCustomValidity('');
    }
  });

  confirmPasswordInput.addEventListener('input', function () {
    if (this.value !== passwordInput.value) {
      this.setCustomValidity('Passwords do not match');
    } else {
      this.setCustomValidity('');
    }
  });

  // Auto-focus first field
  businessNameInput.focus();
})();
