(function () {
  'use strict';

  // ---------------------------------------------------------------
  // This page has no backend endpoint yet (config.js has no entry
  // for it). Progress is persisted to localStorage under STORAGE_KEY
  // so a merchant can leave and come back without losing work.
  // When a real API exists, replace saveState()/submitActivation()
  // with fetch() calls the same way register.js / login.js do it.
  // ---------------------------------------------------------------

  var STORAGE_KEY = 'activation_state_v1';

  // Shared with register.js and login.js — see the comment at the top
  // of register.js for how this flag drives the post-login redirect.
  var PENDING_ACTIVATION_KEY = 'pending_business_activation';
  var ACTIVATION_COMPLETE_KEY = 'business_activation_completed';

  var STEPS = ['business-info', 'business-address', 'account-info', 'owners', 'documents', 'agreement'];

  var NIGERIAN_STATES = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
    'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
    'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe',
    'Zamfara', 'FCT - Abuja'
  ];

  var alertBox = document.getElementById('alert-message');

  var state = loadState();

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore corrupt storage */ }
    return { completedSteps: [], directors: [], uploads: {} };
  }

  function saveState() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { /* storage may be unavailable (e.g. private mode) */ }
  }

  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = 'alert show ' + type;
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    window.setTimeout(function () { alertBox.className = 'alert'; }, 6000);
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c];
    });
  }

  // ---------------- Step navigation ----------------

  function goToStep(stepId) {
    document.querySelectorAll('.step-panel').forEach(function (panel) {
      panel.classList.toggle('active', panel.dataset.panel === stepId);
    });
    document.querySelectorAll('.step-item').forEach(function (item) {
      item.classList.toggle('active', item.dataset.step === stepId);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function markStepComplete(stepId) {
    if (state.completedSteps.indexOf(stepId) === -1) {
      state.completedSteps.push(stepId);
      saveState();
    }
    var navItem = document.querySelector('.step-item[data-step="' + stepId + '"]');
    if (navItem) navItem.classList.add('complete');
    updateProgress();
  }

  function updateProgress() {
    var percent = Math.round((state.completedSteps.length / STEPS.length) * 100);
    document.getElementById('progress-percent').textContent = percent + '%';
    document.getElementById('progress-ring').style.setProperty('--progress', percent);
  }

  document.querySelectorAll('.step-item').forEach(function (item) {
    item.addEventListener('click', function () { goToStep(item.dataset.step); });
  });

  document.querySelectorAll('.step-back').forEach(function (button) {
    button.addEventListener('click', function () { goToStep(button.dataset.prev); });
  });

  // ---------------- Validation per step ----------------

  function requireFields(fields) {
    for (var i = 0; i < fields.length; i++) {
      var el = document.getElementById(fields[i].id);
      if (!el.value || !el.value.trim()) {
        showAlert(fields[i].label + ' is required.', 'error');
        el.focus();
        return false;
      }
    }
    return true;
  }

  function validateStep(stepId) {
    if (stepId === 'business-info') {
      if (!requireFields([
        { id: 'biz-name', label: 'Business name' },
        { id: 'biz-description', label: 'Business description' },
        { id: 'biz-support-email', label: 'Support email' },
        { id: 'biz-chargeback-email', label: 'Chargeback email' },
        { id: 'biz-staff-size', label: 'Staff size' }
      ])) return false;
      if (document.getElementById('biz-description').value.trim().length < 200) {
        showAlert('Business description must be at least 200 characters.', 'error');
        return false;
      }
      return true;
    }
    if (stepId === 'business-address') {
      return requireFields([
        { id: 'addr-state', label: 'State' },
        { id: 'addr-lga', label: 'Local government area' },
        { id: 'addr-line', label: 'Address' }
      ]) && requireUpload('address', 'Proof of business address');
    }
    if (stepId === 'account-info') {
      return requireFields([
        { id: 'acct-bank', label: 'Bank' },
        { id: 'acct-number', label: 'Account number' },
        { id: 'acct-name', label: 'Account name' }
      ]);
    }
    if (stepId === 'owners') {
      if (state.directors.length === 0) {
        showAlert('Add at least one director before continuing.', 'error');
        return false;
      }
      return true;
    }
    if (stepId === 'documents') {
      return requireFields([{ id: 'doc-bn', label: 'BN Number' }])
        && requireUpload('cac', 'CAC document')
        && requireUpload('status', 'Status report');
    }
    return true;
  }

  function requireUpload(key, label) {
    if (!state.uploads[key]) {
      showAlert(label + ' is required.', 'error');
      return false;
    }
    return true;
  }

  document.querySelectorAll('.step-next').forEach(function (button) {
    button.addEventListener('click', function () {
      var current = button.dataset.current;
      if (!validateStep(current)) return;
      markStepComplete(current);
      goToStep(button.dataset.next);
    });
  });

  // ---------------- Business info: character counter ----------------

  var descriptionInput = document.getElementById('biz-description');
  var descriptionCount = document.getElementById('biz-description-count');
  descriptionInput.addEventListener('input', function () {
    descriptionCount.textContent = descriptionInput.value.trim().length;
  });

  // ---------------- State select ----------------

  var stateSelect = document.getElementById('addr-state');
  NIGERIAN_STATES.forEach(function (name) {
    var option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    stateSelect.appendChild(option);
  });

  // ---------------- File uploads (UI only — no storage backend) ----------------

  var MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  function wireDropzone(dropzoneId, inputId, fileDisplayId, storageKey) {
    var dropzone = document.getElementById(dropzoneId);
    var input = document.getElementById(inputId);
    var fileDisplay = document.getElementById(fileDisplayId);
    var content = dropzone.querySelector('.dropzone-content');

    dropzone.addEventListener('click', function () { input.click(); });
    dropzone.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input.click(); }
    });

    input.addEventListener('change', function () {
      var file = input.files[0];
      if (!file) return;
      if (file.size > MAX_FILE_SIZE) {
        showAlert('File is too large. Maximum size is 20MB.', 'error');
        input.value = '';
        return;
      }
      state.uploads[storageKey] = { name: file.name, size: file.size };
      saveState();
      content.hidden = true;
      fileDisplay.hidden = false;
      fileDisplay.innerHTML = '<span class="file-name">' + escapeHtml(file.name) + '</span>' +
        '<button type="button" class="file-remove">Remove</button>';
      fileDisplay.querySelector('.file-remove').addEventListener('click', function (event) {
        event.stopPropagation();
        delete state.uploads[storageKey];
        saveState();
        input.value = '';
        content.hidden = false;
        fileDisplay.hidden = true;
        fileDisplay.innerHTML = '';
      });
    });
  }

  wireDropzone('dropzone-logo', 'file-logo', 'dropzone-logo-file', 'logo');
  wireDropzone('dropzone-address', 'file-address', 'dropzone-address-file', 'address');
  wireDropzone('dropzone-cac', 'file-cac', 'dropzone-cac-file', 'cac');
  wireDropzone('dropzone-status', 'file-status', 'dropzone-status-file', 'status');

  // ---------------- Account number formatting ----------------
  // No verification here — there's no backend endpoint to look up an
  // account name from a bank + account number yet, so the merchant
  // types the account name in themselves (see #acct-name in the HTML).
  // Once that lookup exists, this is the place to call it and replace
  // the free-text field with a read-only confirmed name.

  var acctNumber = document.getElementById('acct-number');
  acctNumber.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
  });

  // ---------------- Directors ----------------

  var directorsList = document.getElementById('directors-list');
  var addDirectorButton = document.getElementById('add-director');
  var directorCounter = 0;

  function renderDirectors() {
    if (state.directors.length === 0) {
      directorsList.innerHTML = '<div class="empty-directors">No directors added yet. Add at least one to continue.</div>';
      return;
    }
    directorsList.innerHTML = state.directors.map(function (director, index) {
      return '' +
        '<div class="director-card" data-director-id="' + director.id + '">' +
          '<div class="director-card-head">' +
            '<h4>Director ' + (index + 1) + '</h4>' +
            '<button type="button" class="btn-remove-director" data-remove="' + director.id + '">Remove</button>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group"><label>Full name <span class="required">*</span></label>' +
              '<input type="text" data-field="name" data-director="' + director.id + '" value="' + escapeHtml(director.name) + '" placeholder="Full name"></div>' +
            '<div class="form-group"><label>Date of birth <span class="required">*</span></label>' +
              '<input type="date" data-field="dob" data-director="' + director.id + '" value="' + escapeHtml(director.dob) + '"></div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group"><label>Email <span class="required">*</span></label>' +
              '<input type="email" data-field="email" data-director="' + director.id + '" value="' + escapeHtml(director.email) + '" placeholder="Email address"></div>' +
            '<div class="form-group"><label>Phone <span class="required">*</span></label>' +
              '<input type="tel" data-field="phone" data-director="' + director.id + '" value="' + escapeHtml(director.phone) + '" placeholder="Phone number"></div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group"><label>ID type <span class="required">*</span></label>' +
              '<select data-field="idType" data-director="' + director.id + '">' +
                '<option value="">Select ID type</option>' +
                '<option value="BVN"' + (director.idType === 'BVN' ? ' selected' : '') + '>BVN</option>' +
                '<option value="NIN"' + (director.idType === 'NIN' ? ' selected' : '') + '>NIN</option>' +
                '<option value="Passport"' + (director.idType === 'Passport' ? ' selected' : '') + '>International Passport</option>' +
                '<option value="DriversLicense"' + (director.idType === 'DriversLicense' ? ' selected' : '') + '>Driver\'s License</option>' +
              '</select></div>' +
            '<div class="form-group"><label>ID number <span class="required">*</span></label>' +
              '<input type="text" data-field="idNumber" data-director="' + director.id + '" value="' + escapeHtml(director.idNumber) + '" placeholder="ID number"></div>' +
          '</div>' +
          '<div class="form-group"><label>Ownership percentage</label>' +
            '<input type="number" min="0" max="100" data-field="ownership" data-director="' + director.id + '" value="' + escapeHtml(director.ownership) + '" placeholder="e.g. 50"></div>' +
        '</div>';
    }).join('');
  }

  directorsList.addEventListener('input', function (event) {
    var field = event.target.dataset.field;
    var directorId = event.target.dataset.director;
    if (!field || !directorId) return;
    var director = state.directors.find(function (d) { return d.id === directorId; });
    if (director) { director[field] = event.target.value; saveState(); }
  });

  directorsList.addEventListener('click', function (event) {
    var removeId = event.target.dataset.remove;
    if (!removeId) return;
    state.directors = state.directors.filter(function (d) { return d.id !== removeId; });
    saveState();
    renderDirectors();
  });

  addDirectorButton.addEventListener('click', function () {
    directorCounter += 1;
    state.directors.push({
      id: 'dir-' + Date.now() + '-' + directorCounter,
      name: '', dob: '', email: '', phone: '', idType: '', idNumber: '', ownership: ''
    });
    saveState();
    renderDirectors();
  });

  renderDirectors();

  // ---------------- Final submit ----------------

  document.getElementById('submit-activation').addEventListener('click', function () {
    var signature = document.getElementById('agreement-signature');
    var checkbox = document.getElementById('agreement-checkbox');

    if (!signature.value.trim()) {
      showAlert('Please type your full name as signature.', 'error');
      signature.focus();
      return;
    }
    if (!checkbox.checked) {
      showAlert('You must agree to the Merchant Agreement and Indemnity Terms.', 'error');
      return;
    }

    markStepComplete('agreement');

    // No submission endpoint exists yet in config.js. Once the backend
    // team adds one (e.g. API_CONFIG.ENDPOINTS.SUBMIT_ACTIVATION), swap
    // the two lines below for a fetch() POST of `state`, following the
    // same pattern as performRegistration() in register.js.
    state.submittedAt = new Date().toISOString();
    saveState();

    try {
      window.localStorage.setItem(ACTIVATION_COMPLETE_KEY, 'true');
      window.localStorage.removeItem(PENDING_ACTIVATION_KEY);
    } catch (e) { /* storage may be unavailable (e.g. private mode) */ }

    showAlert('Business activation submitted for review. We will notify you once verified.', 'success');
    window.setTimeout(function () { window.location.href = 'merchant-dashboard.html'; }, 1800);
  });

  // ---------------- Restore progress on load ----------------

  (function checkAlreadySubmitted() {
    var alreadySubmitted = false;
    try { alreadySubmitted = window.localStorage.getItem(ACTIVATION_COMPLETE_KEY) === 'true'; }
    catch (e) { /* storage may be unavailable */ }
    if (alreadySubmitted) {
      showAlert('You already submitted this for review. You can still make changes below if something needs updating.', 'success');
    }
  })();

  (function restore() {
    state.completedSteps.forEach(function (stepId) {
      var navItem = document.querySelector('.step-item[data-step="' + stepId + '"]');
      if (navItem) navItem.classList.add('complete');
    });
    updateProgress();

    ['logo', 'address', 'cac', 'status'].forEach(function (key) {
      var upload = state.uploads[key];
      if (!upload) return;
      var content = document.getElementById('dropzone-' + key).querySelector('.dropzone-content');
      var fileDisplay = document.getElementById('dropzone-' + key + '-file');
      content.hidden = true;
      fileDisplay.hidden = false;
      fileDisplay.innerHTML = '<span class="file-name">' + escapeHtml(upload.name) + '</span>' +
        '<button type="button" class="file-remove">Remove</button>';
      fileDisplay.querySelector('.file-remove').addEventListener('click', function () {
        delete state.uploads[key];
        saveState();
        document.getElementById('file-' + key).value = '';
        content.hidden = false;
        fileDisplay.hidden = true;
        fileDisplay.innerHTML = '';
      });
    });
  })();
})();
