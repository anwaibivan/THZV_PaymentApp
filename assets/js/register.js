(function () {
  'use strict';

  // API Configuration - loaded from config.js
  var REGISTER_ENDPOINT = getApiUrl(API_CONFIG.ENDPOINTS.REGISTER);
  var VERIFICATION_URL = 'email-verification.html';

  // DOM Elements
  var registerForm = document.getElementById('register-form');
  var businessNameInput = document.getElementById('business-name');
  var contactEmailInput = document.getElementById('contact-email');
  var contactPhoneInput = document.getElementById('contact-phone');
  var settlementBankSelect = document.getElementById('settlement-bank');
  var settlementAccountInput = document.getElementById('settlement-account');
  var passwordInput = document.getElementById('password');
  var confirmPasswordInput = document.getElementById('confirm-password');
  var termsCheckbox = document.getElementById('terms');
  var registerButton = document.getElementById('register-button');
  var alertMessage = document.getElementById('alert-message');
  var accountVerification = document.getElementById('account-verification');
  var verificationLoading = document.getElementById('verification-loading');
  var verificationResult = document.getElementById('verification-result');

  var accountVerificationTimeout = null;

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

    // Validate account number
    if (!/^\d{10}$/.test(settlementAccountInput.value)) {
      showAlert('Account number must be exactly 10 digits', 'error');
      return false;
    }

    

    // Check terms
    if (!termsCheckbox.checked) {
      showAlert('You must agree to the Terms of Service and Privacy Policy', 'error');
      return false;
    }

    return true;
  }

  function verifyBankAccount() {
    var bankCode = settlementBankSelect.value;
    var accountNumber = settlementAccountInput.value;

    if (!bankCode || !accountNumber || accountNumber.length !== 10) {
      accountVerification.classList.remove('show');
      return;
    }

    // Show verification UI
    accountVerification.classList.add('show');
    verificationLoading.style.display = 'flex';
    verificationResult.style.display = 'none';
    verificationResult.className = 'verification-result';

    // Simulate account verification (replace with actual API call)
    setTimeout(function () {
      verificationLoading.style.display = 'none';
      verificationResult.style.display = 'block';
      
      // Mock success response - replace with actual verification
      verificationResult.className = 'verification-result success';
      verificationResult.textContent = '✓ Account verified: Business Account Name';
      
      // For error state, use:
      // verificationResult.className = 'verification-result error';
      // verificationResult.textContent = '✗ Could not verify account. Please check details.';
    }, 1500);
  }

  function handleRegistrationSuccess(data) {
    sessionStorage.setItem('verification_email', contactEmailInput.value.trim());
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
    params.append('settlementBankCode', formData.settlementBankCode);
    params.append('settlementAccountNo', formData.settlementAccountNo);
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
      settlementBankCode: settlementBankSelect.value,
      settlementAccountNo: settlementAccountInput.value.trim(),
      password: passwordInput.value,
      isActive: true
    };

    performRegistration(formData);
  });

  // Account verification on input change
  settlementBankSelect.addEventListener('change', function () {
    clearTimeout(accountVerificationTimeout);
    accountVerificationTimeout = setTimeout(verifyBankAccount, 500);
  });

  settlementAccountInput.addEventListener('input', function () {
    // Only allow numbers
    this.value = this.value.replace(/\D/g, '');
    
    clearTimeout(accountVerificationTimeout);
    accountVerificationTimeout = setTimeout(verifyBankAccount, 800);
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
