(function () {
  'use strict';

  var merchantId = new URLSearchParams(window.location.search).get('merchantId');
  var search = document.getElementById('transaction-search');
  var currency = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 });
  var dashboardEndpoint = getApiUrl(API_CONFIG.ENDPOINTS.DASHBOARD);
  var createPaymentEndpoint = getApiUrl(API_CONFIG.ENDPOINTS.CREATE_PAYMENT);

  // Shared with register.js / login.js / business-activation.js. Shows
  // the 'finish activating' banner only while activation is unfinished.
  (function showActivationNudge() {
    var nudge = document.getElementById('activation-nudge');
    if (!nudge) return;
    var pending = false;
    try { pending = window.localStorage.getItem('pending_business_activation') === 'true'; }
    catch (e) { /* storage may be unavailable */ }
    nudge.hidden = !pending;
  })();

  function money(value, code) {
    try { return new Intl.NumberFormat('en-NG', { style: 'currency', currency: code || 'NGN', maximumFractionDigits: 2 }).format(value); }
    catch (error) { return currency.format(value); }
  }

  function statusClass(status) {
    return status === 'FAILED' ? 'failed' : (status === 'PENDING' ? 'pending' : 'success');
  }

  function loadDashboard() {
    var url = dashboardEndpoint + '?';
    if (merchantId) url += 'merchantId=' + encodeURIComponent(merchantId) + '&';
    if (search.value) url += 'query=' + encodeURIComponent(search.value);
    fetch(url).then(function (response) { return response.json(); }).then(function (data) {
      if (data.error) throw new Error(data.error);
      if (!merchantId && data.merchant) merchantId = String(data.merchant.id);
      document.getElementById('total-volume').textContent = money(data.summary.totalVolume);
      document.getElementById('successful-count').textContent = data.summary.successful.toLocaleString();
      document.getElementById('failed-count').textContent = data.summary.failed.toLocaleString();
      document.getElementById('available-balance').textContent = money(data.summary.availableBalance);
      document.getElementById('transaction-count').textContent = 'Showing ' + data.transactions.length + ' recent transactions';
      document.getElementById('transaction-rows').innerHTML = data.transactions.length ? data.transactions.map(function (transaction) {
        var label = transaction.status === 'SUCCESS' ? 'Successful' : transaction.status.charAt(0) + transaction.status.slice(1).toLowerCase();
        return '<tr><td><div class="cust-name">' + escapeHtml(transaction.customer) + '</div><div class="cust-email">' + escapeHtml(transaction.email) + '</div></td>' +
          '<td class="num">' + escapeHtml(transaction.reference) + '</td><td><span class="method-badge"><span class="method-dot"></span>' + escapeHtml(transaction.method) + (transaction.last4 ? ' &bull; ****' + escapeHtml(transaction.last4) : '') + '</span></td>' +
          '<td>' + new Date(transaction.createdAt).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) + '</td><td><span class="status ' + statusClass(transaction.status) + '"><span class="status-dot"></span>' + label + '</span></td><td class="amount-cell num">' + money(transaction.amount, transaction.currency) + '</td></tr>';
      }).join('') : '<tr><td colspan="6">No transactions found.</td></tr>';
    }).catch(function (error) {
      document.getElementById('transaction-rows').innerHTML = '<tr><td colspan="6">Unable to load transactions: ' + escapeHtml(error.message) + '</td></tr>';
    });
  }

  function escapeHtml(value) { return String(value || '').replace(/[&<>'"]/g, function (character) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]; }); }

  document.getElementById('new-payment-button').addEventListener('click', function () { document.getElementById('payment-form').classList.toggle('open'); });
  document.getElementById('payment-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var message = document.getElementById('form-message');
    var merchant = merchantId || 1;
    fetch(createPaymentEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ merchantId: Number(merchant), amount: Number(document.getElementById('payment-amount').value), currency: document.getElementById('payment-currency').value, idempotencyKey: document.getElementById('payment-key').value, narration: document.getElementById('payment-note').value }) })
      .then(function (response) { return response.json().then(function (data) { if (!response.ok) throw new Error(data.error); return data; }); })
      .then(function (data) { message.textContent = 'Payment ' + data.reference + ' created as pending.'; event.target.reset(); loadDashboard(); })
      .catch(function (error) { message.textContent = error.message; });
  });
  search.addEventListener('input', loadDashboard);
  loadDashboard();
}());
