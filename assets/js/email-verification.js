(function () {
  'use strict';

  var form = document.getElementById('verification-form');
  var inputs = Array.prototype.slice.call(document.querySelectorAll('.otp-input'));
  var emailAddress = document.getElementById('email-address');
  var verifyButton = document.getElementById('verify-button');
  var resendButton = document.getElementById('resend-button');
  var resendTimer = document.getElementById('resend-timer');
  var alertMessage = document.getElementById('alert-message');
  var secondsRemaining = 30;
  var timer;

  function showAlert(message, type) {
    alertMessage.textContent = message;
    alertMessage.className = 'alert show ' + type;
  }

  function updateTimer() {
    var seconds = String(secondsRemaining).padStart(2, '0');
    resendTimer.textContent = '(' + '00:' + seconds + ')';
  }

  function startResendTimer() {
    window.clearInterval(timer);
    secondsRemaining = 30;
    resendButton.disabled = true;
    updateTimer();
    timer = window.setInterval(function () {
      secondsRemaining -= 1;
      updateTimer();
      if (secondsRemaining <= 0) {
        window.clearInterval(timer);
        resendButton.disabled = false;
        resendTimer.textContent = '';
      }
    }, 1000);
  }

  function getCode() {
    return inputs.map(function (input) { return input.value; }).join('');
  }

  emailAddress.textContent = sessionStorage.getItem('verification_email') || 'your email address';

  inputs.forEach(function (input, index) {
    input.addEventListener('input', function () {
      input.value = input.value.replace(/\D/g, '').slice(0, 1);
      if (input.value && inputs[index + 1]) inputs[index + 1].focus();
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Backspace' && !input.value && inputs[index - 1]) inputs[index - 1].focus();
    });

    input.addEventListener('paste', function (event) {
      event.preventDefault();
      var pastedCode = (event.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
      pastedCode.split('').forEach(function (digit, digitIndex) {
        if (inputs[digitIndex]) inputs[digitIndex].value = digit;
      });
      if (inputs[Math.min(pastedCode.length, inputs.length) - 1]) inputs[Math.min(pastedCode.length, inputs.length) - 1].focus();
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (getCode().length !== 6) {
      showAlert('Enter the 6-digit verification code.', 'error');
      return;
    }
    verifyButton.disabled = true;
    verifyButton.textContent = 'Verifying...';
    showAlert('Email verified. Your account is ready.', 'success');
    window.setTimeout(function () { window.location.href = 'index.html'; }, 1200);
  });

  resendButton.addEventListener('click', function () {
    showAlert('A new verification code has been sent.', 'success');
    startResendTimer();
    inputs[0].focus();
  });

  startResendTimer();
  inputs[0].focus();
})();