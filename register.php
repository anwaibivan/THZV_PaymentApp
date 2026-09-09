<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PaymentApp — Merchant Registration</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/register.css">
</head>
<body>
<div class="register-container">
  
  <div class="brand">
    <div class="brand-mark">P</div>
    <div class="brand-name">Payment App</div>
  </div>

  <div class="register-card">
    <div class="register-header">
      <h1>Create merchant account</h1>
      <p>Register your business to start accepting payments</p>
    </div>

    <div class="alert" id="alert-message" role="alert"></div>

    <form id="register-form">
      
      <!-- Business Information Section -->
      <div class="form-section">
        <h2 class="section-title">Business Information</h2>
        <p class="section-description">Business contact information</p>
        
        <div class="formrow">
          <div class="form-group">
            <label for="business-name">Business Name <span class="required">*</span></label>
            <input 
              type="text" 
              id="business-name" 
              name="businessName" 
              placeholder="Enter your business name"
              maxlength="255"
            >
          </div>
        </div><br>

        <div class="form-row">
          <div class="form-group">
            <label for="contact-email">Contact Email <span class="required">*</span></label>
            <input 
              type="email" 
              id="contact-email" 
              name="contactEmail" 
              placeholder="business@example.com"
              autocomplete="email"
            >
          </div>
          
          <div class="form-group">
            <label for="contact-phone">Contact Phone <span class="required">*</span></label>
            <input 
              type="tel" 
              id="contact-phone" 
              name="contactPhone" 
              placeholder="+234 800 000 0000"
            >
          </div>
        </div>
      </div>

      <!-- Settlement Information Section -->
      <div class="form-section">
        <h2 class="section-title">Settlement Information</h2>
        <p class="section-description">Provide your bank details for receiving settlements</p>
        
        <div class="form-row">
          <div class="form-group">
            <label for="settlement-bank">Bank <span class="required">*</span></label>
            <select 
              id="settlement-bank" 
              name="settlementBankCode" 
            >
              <option value="">Select your bank</option>
              <option value="044">Access Bank</option>
              <option value="063">Access Bank (Diamond)</option>
              <option value="050">Ecobank Nigeria</option>
              <option value="070">Fidelity Bank</option>
              <option value="011">First Bank of Nigeria</option>
              <option value="214">First City Monument Bank</option>
              <option value="058">Guaranty Trust Bank</option>
              <option value="030">Heritage Bank</option>
              <option value="301">Jaiz Bank</option>
              <option value="082">Keystone Bank</option>
              <option value="526">Parallex Bank</option>
              <option value="076">Polaris Bank</option>
              <option value="101">Providus Bank</option>
              <option value="221">Stanbic IBTC Bank</option>
              <option value="068">Standard Chartered Bank</option>
              <option value="232">Sterling Bank</option>
              <option value="100">Suntrust Bank</option>
              <option value="032">Union Bank of Nigeria</option>
              <option value="033">United Bank For Africa</option>
              <option value="215">Unity Bank</option>
              <option value="035">Wema Bank</option>
              <option value="057">Zenith Bank</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="settlement-account">Account Number <span class="required">*</span></label>
            <input 
              type="text" 
              id="settlement-account" 
              name="settlementAccountNo" 
              placeholder="0000000000"
              pattern="[0-9]{10}"
              maxlength="10"
            >
            <small class="form-help">10-digit account number</small>
          </div>
        </div>

        <div class="account-verification" id="account-verification">
          <div class="verification-loading" id="verification-loading">
            <span class="spinner"></span>
            Verifying account...
          </div>
          <div class="verification-result" id="verification-result"></div>
        </div>
      </div>

      <!-- Password Section -->
      <div class="form-section">
        <h2 class="section-title">Security</h2>
        
        <div class="form-row">
          <div class="form-group">
            <label for="password">Password <span class="required">*</span></label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Create a strong password"
              minlength="8"
              autocomplete="new-password"
            >
            <small class="form-help">Minimum 8 characters</small>
          </div>
          
          <div class="form-group">
            <label for="confirm-password">Confirm Password <span class="required">*</span></label>
            <input 
              type="password" 
              id="confirm-password" 
              name="confirmPassword" 
              placeholder="Re-enter your password"
              minlength="8"
              autocomplete="new-password"
            >
          </div>
        </div>
      </div>

      <!-- Terms and Conditions -->
      <div class="form-section">
        <div class="checkbox-group">
          <input type="checkbox" id="terms" name="terms">
          <label for="terms">
            I agree to the <a href="#" class="link">Terms of Service</a> and <a href="#" class="link">Privacy Policy</a>
          </label>
        </div>
      </div>

      <button type="submit" class="btn-register" id="register-button">
        Create Account
      </button>
    </form>

    <div class="register-footer">
      Already have an account? <a href="index.php" class="link">Sign in</a>
    </div>
  </div>

</div>

<script src="assets/js/config.js"></script>
<script src="assets/js/register.js"></script>
</body>
</html>
