import { store } from '../state/store.js';
import { icons } from '../utils/icons.js';
import { showToast } from '../utils/toast.js';

let currentFilterStatus = 'ALL';
let currentSelectedSubId = null;

export function renderSubscriptions(navigate, initialSubId = null) {
  if (initialSubId) {
    currentSelectedSubId = initialSubId;
  }

  const state = store.loadState();
  const subs = state.subscriptions || [];

  if (currentSelectedSubId) {
    const selectedSub = subs.find(s => s.id === currentSelectedSubId);
    if (selectedSub) {
      return renderSubscriptionDetail(selectedSub, navigate);
    }
  }

  // Filter list
  let filtered = subs;
  if (currentFilterStatus !== 'ALL') {
    filtered = subs.filter(s => s.status.toUpperCase() === currentFilterStatus);
  }

  return `
    <div>
      <div class="sub-navbar">
        <div class="sub-navbar-left">
          <div class="page-title-group">
            <h1>${icons.subscription} Subscriptions Lifecycle Pipeline</h1>
            <span class="page-subtitle">Track, quote, confirm, activate, and manage recurring customer contracts</span>
          </div>
        </div>
        <div class="sub-navbar-actions">
          <div class="search-box">
            ${icons.search}
            <input type="text" class="form-control" id="search-subs" placeholder="Search number, customer..." />
          </div>
          <button class="btn btn-teal btn-sm" id="btn-new-from-template">
            ${icons.template} New from Template
          </button>
          <button class="btn btn-primary btn-sm" id="btn-new-sub">
            ${icons.plus} New Subscription
          </button>
        </div>
      </div>

      <div class="main-content">
        <!-- Filter Tabs -->
        <div style="display:flex; gap: 8px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 4px;">
          ${['ALL', 'DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'CLOSED'].map(status => {
            const count = status === 'ALL' ? subs.length : subs.filter(s => s.status.toUpperCase() === status).length;
            const isActive = currentFilterStatus === status;
            return `
              <button class="btn ${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm filter-tab-btn" data-status="${status}">
                ${status === 'ALL' ? 'All Subscriptions' : status}
                <span style="opacity: 0.8; font-size: 0.725rem; margin-left: 4px;">(${count})</span>
              </button>
            `;
          }).join('')}
        </div>

        <div class="card">
          <div class="card-body" style="padding: 0;">
            <div class="table-responsive">
              <table class="table table-clickable" id="subs-table">
                <thead>
                  <tr>
                    <th>Subscription #</th>
                    <th>Customer / Company</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>Expiry Date</th>
                    <th>Next Billing</th>
                    <th>Total Recurring</th>
                    <th style="text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.length === 0 ? `
                    <tr>
                      <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-dim);">
                        No subscriptions found matching the current filter.
                      </td>
                    </tr>
                  ` : filtered.map(s => {
                    const plan = state.plans.find(p => p.id === s.planId);
                    const total = s.lines.reduce((sum, l) => sum + (Number(l.quantity) * Number(l.unitPrice)), 0);
                    return `
                      <tr class="sub-row" data-id="${s.id}">
                        <td><strong>${s.number}</strong></td>
                        <td>
                          <div style="font-weight: 600;">${s.customerName}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">${s.companyName || ''}</div>
                        </td>
                        <td>
                          <span style="font-weight: 500;">${plan ? plan.name : 'Custom Plan'}</span>
                          <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">${plan ? plan.billingFrequency : ''}</span>
                        </td>
                        <td>
                          <span class="badge badge-${s.status.toLowerCase()}">${s.status}</span>
                        </td>
                        <td>${s.startDate || '-'}</td>
                        <td>${s.expiryDate || '-'}</td>
                        <td>
                          ${s.nextBillingDate ? `<strong>${s.nextBillingDate}</strong>` : '-'}
                        </td>
                        <td style="font-weight: 700; color: var(--primary);">
                          $${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td style="text-align: right;" onclick="event.stopPropagation();">
                          <button class="btn btn-secondary btn-sm btn-open-sub" data-id="${s.id}">
                            Open Record &rarr;
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSubscriptionDetail(sub, navigate) {
  const state = store.loadState();
  const plan = state.plans.find(p => p.id === sub.planId);
  const taxes = state.taxes || [];
  const products = state.products || [];

  // Totals calculation
  let subtotal = 0;
  sub.lines.forEach(line => {
    subtotal += Number(line.quantity) * Number(line.unitPrice);
  });

  let discountAmount = 0;
  if (sub.appliedDiscountCode) {
    const disc = state.discounts.find(d => d.code === sub.appliedDiscountCode);
    if (disc) {
      discountAmount = disc.type === 'percentage' ? (subtotal * disc.value / 100) : disc.value;
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const defaultTax = taxes.find(t => t.isDefault) || taxes[0];
  const taxRate = defaultTax ? defaultTax.rate : 0.10;
  const taxAmount = discountedSubtotal * taxRate;
  const grandTotal = discountedSubtotal + taxAmount;

  const planRules = plan ? plan.rules : { allowPause: true, allowEarlyClose: true, allowRenewal: true };

  return `
    <div>
      <div class="sub-navbar">
        <div class="sub-navbar-left">
          <button class="btn btn-secondary btn-sm" id="btn-back-to-subs">
            &larr; Back to Subscriptions List
          </button>
          <div class="page-title-group">
            <h1>${sub.number} <span class="badge badge-${sub.status.toLowerCase()}">${sub.status}</span></h1>
            <span class="page-subtitle">${sub.customerName} (${sub.companyName})</span>
          </div>
        </div>

        <div class="sub-navbar-actions">
          <!-- Odoo Status Pipeline Stepper -->
          <div class="status-pipeline">
            <span class="stage-step ${sub.status === 'Draft' ? 'active' : 'completed'}">Draft</span>
            <span class="stage-separator">&gt;</span>
            <span class="stage-step ${sub.status === 'Quotation' ? 'active' : sub.status === 'Draft' ? '' : 'completed'}">Quotation</span>
            <span class="stage-separator">&gt;</span>
            <span class="stage-step ${sub.status === 'Confirmed' ? 'active' : ['Draft', 'Quotation'].includes(sub.status) ? '' : 'completed'}">Confirmed</span>
            <span class="stage-separator">&gt;</span>
            <span class="stage-step ${sub.status === 'Active' ? 'active' : ['Draft', 'Quotation', 'Confirmed'].includes(sub.status) ? '' : 'completed'}">Active</span>
            ${sub.status === 'Paused' ? `
              <span class="stage-separator">&gt;</span>
              <span class="stage-step paused">Paused</span>
            ` : ''}
            <span class="stage-separator">&gt;</span>
            <span class="stage-step ${sub.status === 'Closed' ? 'closed' : ''}">Closed</span>
          </div>
        </div>
      </div>

      <div class="main-content">
        <!-- Action Buttons Bar -->
        <div style="background: #fff; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: 10px;">
          <div style="display:flex; gap: 8px; flex-wrap: wrap;">
            ${sub.status === 'Draft' ? `
              <button class="btn btn-primary btn-sm" id="btn-act-quote">
                ${icons.mail} Send Quotation
              </button>
            ` : ''}

            ${sub.status === 'Quotation' ? `
              <button class="btn btn-teal btn-sm" id="btn-act-confirm">
                ${icons.check} Confirm Order
              </button>
            ` : ''}

            ${sub.status === 'Confirmed' ? `
              <button class="btn btn-teal btn-sm" id="btn-act-activate">
                ${icons.play} Activate Subscription
              </button>
            ` : ''}

            ${sub.status === 'Active' ? `
              ${planRules.allowPause ? `
                <button class="btn btn-secondary btn-sm" id="btn-act-pause" style="color: #c2410c;">
                  ${icons.pause} Pause Subscription
                </button>
              ` : ''}
              ${planRules.allowEarlyClose ? `
                <button class="btn btn-outline-danger btn-sm" id="btn-act-close">
                  ${icons.x} Close Subscription
                </button>
              ` : ''}
              ${planRules.allowRenewal ? `
                <button class="btn btn-secondary btn-sm" id="btn-act-renew">
                  ${icons.rotate} Renew Contract
                </button>
              ` : ''}
              <button class="btn btn-primary btn-sm" id="btn-act-invoice-now">
                ${icons.invoice} Create Invoice Now
              </button>
            ` : ''}

            ${sub.status === 'Paused' ? `
              <button class="btn btn-teal btn-sm" id="btn-act-resume">
                ${icons.play} Resume Active Service
              </button>
            ` : ''}
          </div>

          <div style="font-size: 0.8rem; color: var(--text-muted);">
            Lifecycle Rules:
            <strong>${planRules.autoCloseOnEnd ? 'Auto-closes on end' : 'Renews continuously'}</strong> &bull;
            Pause: <strong>${planRules.allowPause ? 'Allowed' : 'Disabled'}</strong> &bull;
            Early Close: <strong>${planRules.allowEarlyClose ? 'Allowed' : 'Locked'}</strong>
          </div>
        </div>

        <!-- Master Details Card -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Subscription Specifications</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Payment Terms: <strong>${sub.paymentTerms || 'Immediate'}</strong></span>
          </div>
          <div class="card-body">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px;">
              <div>
                <span class="form-label">Customer Account</span>
                <div style="font-weight: 700; font-size: 0.95rem; margin-top: 3px;">${sub.customerName}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${sub.companyName}</div>
              </div>
              <div>
                <span class="form-label">Subscription Plan</span>
                <div style="font-weight: 700; font-size: 0.95rem; margin-top: 3px; color: var(--primary);">
                  ${plan ? plan.name : 'Custom'}
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">Billing Frequency: ${plan ? plan.billingFrequency.toUpperCase() : 'MONTHLY'}</div>
              </div>
              <div>
                <span class="form-label">Contract Period</span>
                <div style="font-weight: 600; font-size: 0.9rem; margin-top: 3px;">${sub.startDate} to ${sub.expiryDate || 'Open-ended'}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">Next Cycle: <strong>${sub.nextBillingDate || 'Pending'}</strong></div>
              </div>
              <div>
                <span class="form-label">Applied Discount Tier</span>
                <div style="margin-top: 4px;">
                  ${sub.appliedDiscountCode ? `
                    <span class="badge badge-active">${sub.appliedDiscountCode} (Auto-applied)</span>
                  ` : `
                    <span style="font-size: 0.825rem; color: var(--text-dim);">No discount applied</span>
                  `}
                </div>
              </div>
            </div>

            <!-- Order Lines Section -->
            <div style="margin-top: 20px;">
              <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 12px; color: var(--text-main);">
                Contracted Products & Add-on Lines
              </h4>
              <div class="table-responsive">
                <table class="table table-lines">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Variant Specification</th>
                      <th style="width: 100px;">Quantity</th>
                      <th style="width: 130px;">Unit Price</th>
                      <th style="width: 120px;">Taxes</th>
                      <th style="text-align: right; width: 140px;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${sub.lines.map((line, idx) => {
                      const prod = products.find(p => p.id === line.productId);
                      const variant = prod ? prod.variants.find(v => v.id === line.variantId) : null;
                      const lineTax = taxes.find(t => t.id === line.taxId) || defaultTax;
                      const amount = Number(line.quantity) * Number(line.unitPrice);

                      return `
                        <tr>
                          <td>
                            <strong>${prod ? prod.name : 'Unknown Product'}</strong>
                            <div style="font-size: 0.725rem; color: var(--text-dim);">${prod ? prod.type : ''}</div>
                          </td>
                          <td>
                            <span class="badge" style="background: #f1f5f9; color: var(--text-main); font-weight: 500;">
                              ${variant ? variant.name : 'Standard'}
                              ${variant && variant.extraPrice > 0 ? ` (+$${variant.extraPrice})` : ''}
                            </span>
                          </td>
                          <td><strong>${line.quantity}</strong></td>
                          <td>$${Number(line.unitPrice).toFixed(2)}</td>
                          <td>${lineTax ? lineTax.name : '10%'}</td>
                          <td style="text-align: right; font-weight: 700;">$${amount.toFixed(2)}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Totals Breakdown Table -->
              <div class="invoice-totals-wrapper">
                <table class="invoice-totals-table">
                  <tr>
                    <td style="color: var(--text-muted);">Untaxed Amount:</td>
                    <td style="text-align: right; font-weight: 600;">$${subtotal.toFixed(2)}</td>
                  </tr>
                  ${discountAmount > 0 ? `
                    <tr style="color: #16a34a;">
                      <td>Discount (${sub.appliedDiscountCode}):</td>
                      <td style="text-align: right; font-weight: 600;">-$${discountAmount.toFixed(2)}</td>
                    </tr>
                  ` : ''}
                  <tr>
                    <td style="color: var(--text-muted);">Taxes (${defaultTax ? defaultTax.name : 'VAT'}):</td>
                    <td style="text-align: right; font-weight: 600;">$${taxAmount.toFixed(2)}</td>
                  </tr>
                  <tr class="grand-total">
                    <td>Recurring Total:</td>
                    <td style="text-align: right;">$${grandTotal.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindSubscriptionEvents(navigate) {
  // Filter tabs
  document.querySelectorAll('.filter-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentFilterStatus = e.currentTarget.getAttribute('data-status');
      currentSelectedSubId = null;
      navigate('subscriptions');
    });
  });

  // Table row click -> detail
  document.querySelectorAll('.sub-row, .btn-open-sub').forEach(el => {
    el.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      currentSelectedSubId = id;
      navigate('subscriptions', { subId: id });
    });
  });

  // Back button
  const btnBack = document.getElementById('btn-back-to-subs');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      currentSelectedSubId = null;
      navigate('subscriptions');
    });
  }

  // Search
  const searchInput = document.getElementById('search-subs');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#subs-table tbody tr').forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  // New Subscription button
  const btnNew = document.getElementById('btn-new-sub');
  if (btnNew) {
    btnNew.addEventListener('click', () => openNewSubscriptionModal(navigate));
  }

  // New from Template button
  const btnFromTmpl = document.getElementById('btn-new-from-template');
  if (btnFromTmpl) {
    btnFromTmpl.addEventListener('click', () => navigate('templates'));
  }

  // Lifecycle Action Handlers
  const bindAction = (btnId, nextStatus, confirmMsg, successMsg) => {
    const btn = document.getElementById(btnId);
    if (btn && currentSelectedSubId) {
      btn.addEventListener('click', () => {
        if (!confirmMsg || confirm(confirmMsg)) {
          try {
            store.updateSubscriptionStatus(currentSelectedSubId, nextStatus);
            showToast(successMsg, 'success');
            navigate('subscriptions', { subId: currentSelectedSubId });
          } catch (err) {
            showToast(err.message, 'error');
          }
        }
      });
    }
  };

  bindAction('btn-act-quote', 'Quotation', null, 'Quotation dispatched to customer!');
  bindAction('btn-act-confirm', 'Confirmed', null, 'Order confirmed and ready for activation.');
  bindAction('btn-act-activate', 'Active', null, 'Subscription is now ACTIVE! Billing cycle initiated.');
  bindAction('btn-act-pause', 'Paused', 'Are you sure you want to pause this subscription?', 'Subscription paused.');
  bindAction('btn-act-resume', 'Active', null, 'Subscription resumed to Active status!');
  bindAction('btn-act-close', 'Closed', 'Confirm contract termination / early close?', 'Subscription closed.');

  // Renew action
  const btnRenew = document.getElementById('btn-act-renew');
  if (btnRenew && currentSelectedSubId) {
    btnRenew.addEventListener('click', () => {
      try {
        const sub = store.renewSubscription(currentSelectedSubId);
        showToast(`Subscription renewed! New contract expiry: ${sub.expiryDate}`, 'success');
        navigate('subscriptions', { subId: currentSelectedSubId });
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Create Invoice Now action
  const btnInvNow = document.getElementById('btn-act-invoice-now');
  if (btnInvNow && currentSelectedSubId) {
    btnInvNow.addEventListener('click', () => {
      const state = store.loadState();
      const sub = state.subscriptions.find(s => s.id === currentSelectedSubId);
      if (sub) {
        const inv = store.generateInvoiceFromSub(sub);
        showToast(`Invoice ${inv.number} generated for ${sub.customerName}!`, 'success');
        navigate('invoices', { invoiceId: inv.id });
      }
    });
  }
}

function openNewSubscriptionModal(navigate) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  const state = store.loadState();
  const customers = state.users.filter(u => u.role === 'customer');
  const plans = state.plans || [];
  const products = state.products || [];

  container.innerHTML = `
    <div class="modal-backdrop" id="new-sub-modal-backdrop">
      <div class="modal-content modal-content-lg">
        <div class="modal-header">
          <div class="modal-title">
            <span style="color: var(--primary);">${icons.subscription}</span>
            Create New Subscription
          </div>
          <button class="modal-close-btn" id="modal-close">&times;</button>
        </div>
        <form id="new-sub-form">
          <div class="modal-body">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">Customer Account <span class="required">*</span></label>
                <select class="form-control form-select" id="ns-customer" required>
                  ${customers.map(c => `
                    <option value="${c.id}">${c.name} - ${c.companyName || c.email}</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Subscription Plan <span class="required">*</span></label>
                <select class="form-control form-select" id="ns-plan" required>
                  ${plans.map(p => `
                    <option value="${p.id}">${p.name} ($${p.price}/${p.billingFrequency})</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Contract Start Date</label>
                <input type="date" class="form-control" id="ns-start-date" value="${new Date().toISOString().split('T')[0]}" />
              </div>

              <div class="form-group">
                <label class="form-label">Payment Terms</label>
                <select class="form-control form-select" id="ns-terms">
                  <option value="Immediate">Immediate Payment</option>
                  <option value="15 Days">Net 15 Days</option>
                  <option value="30 Days">Net 30 Days</option>
                </select>
              </div>
            </div>

            <div style="margin-top: 16px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                <label class="form-label" style="margin-bottom:0;">Product Lines</label>
                <button type="button" class="btn btn-secondary btn-sm" id="btn-add-line">
                  ${icons.plus} Add Line Item
                </button>
              </div>

              <div id="lines-container" style="display:flex; flex-direction:column; gap: 10px;">
                <!-- Initial Line Item -->
                <div class="line-item-row" style="display:grid; grid-template-columns: 2fr 2fr 1fr 1.2fr 40px; gap: 8px; align-items:center;">
                  <select class="form-control form-select sel-prod">
                    ${products.map(p => `<option value="${p.id}" data-price="${p.salesPrice}">${p.name}</option>`).join('')}
                  </select>
                  <select class="form-control form-select sel-var">
                    <!-- populated dynamically -->
                  </select>
                  <input type="number" class="form-control inp-qty" min="1" value="1" placeholder="Qty" />
                  <input type="number" class="form-control inp-price" step="0.01" placeholder="Price" />
                  <button type="button" class="btn-outline-danger btn-sm btn-del-line" style="height:38px; border-radius:4px; display:flex; align-items:center; justify-content:center;">&times;</button>
                </div>
              </div>
            </div>

            <div style="margin-top: 16px;">
              <label class="form-label">Internal Notes</label>
              <textarea class="form-control" id="ns-notes" rows="2" placeholder="Specific SLA or billing provisions..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="modal-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Draft Subscription</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const updateVariantsForLine = (row) => {
    const prodSelect = row.querySelector('.sel-prod');
    const varSelect = row.querySelector('.sel-var');
    const priceInput = row.querySelector('.inp-price');
    const selectedProd = products.find(p => p.id === prodSelect.value);

    if (selectedProd) {
      varSelect.innerHTML = selectedProd.variants.map(v => `
        <option value="${v.id}" data-extra="${v.extraPrice}">
          ${v.name} ${v.extraPrice > 0 ? `(+$${v.extraPrice})` : ''}
        </option>
      `).join('');

      const basePrice = Number(selectedProd.salesPrice || 0);
      const extra = Number(selectedProd.variants[0]?.extraPrice || 0);
      priceInput.value = (basePrice + extra).toFixed(2);
    }
  };

  const initRow = (row) => {
    updateVariantsForLine(row);
    row.querySelector('.sel-prod').addEventListener('change', () => updateVariantsForLine(row));
    row.querySelector('.sel-var').addEventListener('change', () => {
      const prodSelect = row.querySelector('.sel-prod');
      const varSelect = row.querySelector('.sel-var');
      const priceInput = row.querySelector('.inp-price');
      const selectedProd = products.find(p => p.id === prodSelect.value);
      const selectedVar = selectedProd?.variants.find(v => v.id === varSelect.value);
      if (selectedProd && selectedVar) {
        priceInput.value = (Number(selectedProd.salesPrice) + Number(selectedVar.extraPrice)).toFixed(2);
      }
    });
    row.querySelector('.btn-del-line').addEventListener('click', () => {
      const allRows = document.querySelectorAll('.line-item-row');
      if (allRows.length > 1) {
        row.remove();
      } else {
        showToast('At least one product line is required.', 'warning');
      }
    });
  };

  initRow(container.querySelector('.line-item-row'));

  document.getElementById('btn-add-line').addEventListener('click', () => {
    const linesContainer = document.getElementById('lines-container');
    const newRow = document.createElement('div');
    newRow.className = 'line-item-row';
    newRow.style.cssText = 'display:grid; grid-template-columns: 2fr 2fr 1fr 1.2fr 40px; gap: 8px; align-items:center;';
    newRow.innerHTML = `
      <select class="form-control form-select sel-prod">
        ${products.map(p => `<option value="${p.id}" data-price="${p.salesPrice}">${p.name}</option>`).join('')}
      </select>
      <select class="form-control form-select sel-var"></select>
      <input type="number" class="form-control inp-qty" min="1" value="1" placeholder="Qty" />
      <input type="number" class="form-control inp-price" step="0.01" placeholder="Price" />
      <button type="button" class="btn-outline-danger btn-sm btn-del-line" style="height:38px; border-radius:4px; display:flex; align-items:center; justify-content:center;">&times;</button>
    `;
    linesContainer.appendChild(newRow);
    initRow(newRow);
  });

  const closeModal = () => { container.innerHTML = ''; };
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);

  document.getElementById('new-sub-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const customerId = document.getElementById('ns-customer').value;
    const planId = document.getElementById('ns-plan').value;
    const startDate = document.getElementById('ns-start-date').value;
    const paymentTerms = document.getElementById('ns-terms').value;
    const notes = document.getElementById('ns-notes').value;

    const customer = state.users.find(u => u.id === customerId);
    const plan = state.plans.find(p => p.id === planId);

    // Compute expiry
    const expiry = new Date(startDate);
    if (plan.billingFrequency === 'yearly') expiry.setFullYear(expiry.getFullYear() + 1);
    else if (plan.billingFrequency === 'weekly') expiry.setDate(expiry.getDate() + 7);
    else if (plan.billingFrequency === 'daily') expiry.setDate(expiry.getDate() + 1);
    else expiry.setMonth(expiry.getMonth() + 1);

    const lines = [];
    document.querySelectorAll('.line-item-row').forEach(row => {
      const prodId = row.querySelector('.sel-prod').value;
      const varId = row.querySelector('.sel-var').value;
      const qty = Number(row.querySelector('.inp-qty').value || 1);
      const price = Number(row.querySelector('.inp-price').value || 0);

      lines.push({
        productId: prodId,
        variantId: varId,
        quantity: qty,
        unitPrice: price,
        taxId: 'tax-vat'
      });
    });

    const subNumber = 'SUB-2026-' + String(state.subscriptions.length + 1).padStart(4, '0');

    const newSub = {
      id: 'sub-' + Date.now(),
      number: subNumber,
      customerId: customer.id,
      customerName: customer.name,
      companyName: customer.companyName,
      planId,
      status: 'Draft',
      startDate,
      expiryDate: expiry.toISOString().split('T')[0],
      nextBillingDate: startDate,
      paymentTerms,
      lastBilledDate: null,
      lines,
      appliedDiscountCode: null,
      notes
    };

    store.autoApplyBestDiscount(newSub);
    state.subscriptions.unshift(newSub);
    store.saveState();

    showToast(`Draft Subscription ${subNumber} created successfully!`, 'success');
    closeModal();
    currentSelectedSubId = newSub.id;
    navigate('subscriptions', { subId: newSub.id });
  });
}
