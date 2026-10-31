import { store } from '../state/store.js';
import { icons } from '../utils/icons.js';
import { showToast } from '../utils/toast.js';

export function renderDiscounts(navigate) {
  const state = store.loadState();
  const discounts = state.discounts || [];
  const products = state.products || [];
  const currentUser = state.currentUser;
  const isAdmin = currentUser.role === 'admin';

  return `
    <div>
      <div class="sub-navbar">
        <div class="sub-navbar-left">
          <div class="page-title-group">
            <h1>${icons.discount} Automated Discount Rules Engine</h1>
            <span class="page-subtitle">Configure tiered seat discounts, promotional coupons, and usage-capped price reductions</span>
          </div>
        </div>
        <div class="sub-navbar-actions">
          ${isAdmin ? `
            <button class="btn btn-primary btn-sm" id="btn-create-discount">
              ${icons.plus} Create Discount Rule
            </button>
          ` : `
            <div class="badge badge-paused" style="padding: 6px 12px;">
              Admin Access Required to Configure Rules
            </div>
          `}
        </div>
      </div>

      <div class="main-content">
        <!-- RBAC & Scene 5 Explanatory Banner -->
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-md); padding: 16px 20px; margin-bottom: 24px; display:flex; gap: 14px; align-items:flex-start;">
          <div style="color: #d97706; margin-top: 2px;">${icons.discount}</div>
          <div style="font-size: 0.85rem; color: #92400e; line-height: 1.5;">
            <strong>Autonomous Discount Engine (Admin Protected):</strong>
            When customers request discounts for taking more seats or volume commitments, only the <strong>Admin</strong> can author discount rules. The engine evaluates minimum purchase thresholds, start/end dates, and strict usage counts. Once active, discounts automatically appear on recurring invoices and cease when expired or exhausted.
          </div>
        </div>

        <!-- Discount Rules Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; margin-bottom: 30px;">
          ${discounts.map(d => {
            const usagePercent = d.maxUsageCount ? Math.min(100, Math.round(((d.currentUsageCount || 0) / d.maxUsageCount) * 100)) : 0;
            const isExhausted = d.maxUsageCount && (d.currentUsageCount || 0) >= d.maxUsageCount;
            const targetProd = d.targetProductId ? products.find(p => p.id === d.targetProductId) : null;

            return `
              <div class="card" style="margin-bottom:0; display:flex; flex-direction:column;">
                <div class="card-header">
                  <div>
                    <h3 class="card-title" style="font-size: 1rem;">${d.name}</h3>
                    <code style="font-size: 0.8rem; background: var(--primary-subtle); color: var(--primary); padding: 2px 6px; border-radius: var(--radius-xs); font-weight:700;">
                      ${d.code}
                    </code>
                  </div>
                  <span class="badge ${isExhausted ? 'badge-closed' : 'badge-active'}">
                    ${isExhausted ? 'Exhausted' : 'Active'}
                  </span>
                </div>
                <div class="card-body" style="flex:1;">
                  <div style="font-size: 1.35rem; font-weight: 800; color: var(--primary); margin-bottom: 8px;">
                    ${d.type === 'percentage' ? `${d.value}% Off` : `$${d.value.toFixed(2)} Off`}
                    <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">
                      (${d.scope === 'subscription' ? 'Entire Subscription' : `Product: ${targetProd ? targetProd.name : 'Selected'}`})
                    </span>
                  </div>

                  <div style="background: #f8fafc; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 14px; font-size: 0.8rem; display:flex; flex-direction:column; gap: 4px;">
                    <div>Min Seats / Quantity: <strong>${d.minQuantity ? `${d.minQuantity} seats` : 'None'}</strong></div>
                    <div>Min Purchase Amount: <strong>${d.minPurchase ? `$${d.minPurchase}` : 'None'}</strong></div>
                    <div>Validity Period: <strong>${d.startDate || 'Any'} to ${d.endDate || 'No expiry'}</strong></div>
                  </div>

                  <!-- Usage Limit Meter -->
                  <div>
                    <div style="display:flex; justify-content:space-between; font-size: 0.775rem; margin-bottom: 4px;">
                      <span style="color: var(--text-muted);">Usage Limit:</span>
                      <strong style="color: ${isExhausted ? '#dc2626' : 'var(--text-main)'};">
                        ${d.currentUsageCount || 0} / ${d.maxUsageCount || 'Unlimited'} applied
                      </strong>
                    </div>
                    <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 99px; overflow: hidden;">
                      <div style="width: ${usagePercent}%; height: 100%; background: ${isExhausted ? '#dc2626' : 'var(--teal)'}; transition: width 0.3s ease;"></div>
                    </div>
                  </div>
                </div>
                <div style="padding: 10px 20px; background: #fafbfc; border-top: 1px solid var(--border-light); font-size: 0.75rem; color: var(--text-dim); display:flex; justify-content:space-between;">
                  <span>Auto-applied by engine</span>
                  <span>ID: ${d.id}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Live Discount Qualification Simulator -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Live Discount Qualification Simulator</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Test how rules evaluate for incoming customer quotes</span>
          </div>
          <div class="card-body">
            <div style="display:grid; grid-template-columns: 1fr 1fr 2fr; gap: 16px; align-items:flex-end;">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Customer Order Quantity (Seats)</label>
                <input type="number" class="form-control" id="sim-seats" value="6" min="1" />
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Order Subtotal ($)</label>
                <input type="number" class="form-control" id="sim-subtotal" value="4500" min="0" />
              </div>
              <div id="sim-result-box" style="padding: 10px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-sm); font-size: 0.85rem; color: #166534;">
                <!-- Result populated dynamically -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindDiscountEvents(navigate) {
  const btnCreate = document.getElementById('btn-create-discount');
  if (btnCreate) {
    btnCreate.addEventListener('click', () => openNewDiscountModal(navigate));
  }

  // Live Simulator inputs
  const simSeats = document.getElementById('sim-seats');
  const simSubtotal = document.getElementById('sim-subtotal');
  const simBox = document.getElementById('sim-result-box');

  const updateSim = () => {
    if (!simSeats || !simSubtotal || !simBox) return;
    const qty = Number(simSeats.value || 0);
    const total = Number(simSubtotal.value || 0);

    const state = store.loadState();
    const today = new Date().toISOString().split('T')[0];

    const eligible = (state.discounts || []).filter(d => {
      if (d.startDate && d.startDate > today) return false;
      if (d.endDate && d.endDate < today) return false;
      if (d.maxUsageCount && (d.currentUsageCount || 0) >= d.maxUsageCount) return false;
      if (d.minQuantity && qty < d.minQuantity) return false;
      if (d.minPurchase && total < d.minPurchase) return false;
      return true;
    });

    if (eligible.length > 0) {
      const best = eligible[0];
      const savings = best.type === 'percentage' ? (total * best.value / 100) : best.value;
      simBox.innerHTML = `
        <strong>Qualified for ${best.name}!</strong><br />
        Savings: <span style="font-weight:800; color:#15803d;">-$${savings.toFixed(2)}</span> &bull; 
        Net Invoice: <strong>$${Math.max(0, total - savings).toFixed(2)}</strong>
      `;
      simBox.style.background = '#f0fdf4';
      simBox.style.borderColor = '#bbf7d0';
      simBox.style.color = '#166534';
    } else {
      simBox.innerHTML = `
        <strong>No discounts qualify for this configuration.</strong><br />
        Threshold required: minimum 5 seats or $1,000 purchase.
      `;
      simBox.style.background = '#f8fafc';
      simBox.style.borderColor = '#e2e8f0';
      simBox.style.color = '#64748b';
    }
  };

  if (simSeats) simSeats.addEventListener('input', updateSim);
  if (simSubtotal) simSubtotal.addEventListener('input', updateSim);
  updateSim();
}

function openNewDiscountModal(navigate) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  const state = store.loadState();
  const products = state.products || [];

  container.innerHTML = `
    <div class="modal-backdrop" id="new-disc-modal-backdrop">
      <div class="modal-content modal-content-sm">
        <div class="modal-header">
          <div class="modal-title">
            <span style="color: var(--primary);">${icons.discount}</span>
            New Discount Rule (Admin Only)
          </div>
          <button class="modal-close-btn" id="modal-close">&times;</button>
        </div>
        <form id="new-disc-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Rule Name <span class="required">*</span></label>
              <input type="text" class="form-control" id="nd-name" placeholder="e.g. Volume Tier (15% Off)" required />
            </div>

            <div class="form-group">
              <label class="form-label">Discount Code <span class="required">*</span></label>
              <input type="text" class="form-control" id="nd-code" placeholder="e.g. SEATS15" style="text-transform:uppercase;" required />
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Type</label>
                <select class="form-control form-select" id="nd-type">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Discount Value <span class="required">*</span></label>
                <input type="number" step="0.01" class="form-control" id="nd-val" placeholder="e.g. 15 or 200" required />
              </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Min Quantity (Seats)</label>
                <input type="number" class="form-control" id="nd-min-qty" value="0" min="0" />
              </div>

              <div class="form-group">
                <label class="form-label">Min Purchase ($)</label>
                <input type="number" class="form-control" id="nd-min-purchase" value="0" min="0" />
              </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Start Date</label>
                <input type="date" class="form-control" id="nd-start" value="${new Date().toISOString().split('T')[0]}" />
              </div>

              <div class="form-group">
                <label class="form-label">End Date</label>
                <input type="date" class="form-control" id="nd-end" value="2027-12-31" />
              </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Maximum Uses Limit</label>
                <input type="number" class="form-control" id="nd-max-uses" value="50" min="1" />
              </div>

              <div class="form-group">
                <label class="form-label">Scope</label>
                <select class="form-control form-select" id="nd-scope">
                  <option value="subscription">Whole Subscription</option>
                  <option value="product">Specific Product</option>
                </select>
              </div>
            </div>

            <div class="form-group" id="target-prod-group" style="display:none;">
              <label class="form-label">Target Product</label>
              <select class="form-control form-select" id="nd-target-prod">
                ${products.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="modal-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Discount Rule</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const scopeSelect = document.getElementById('nd-scope');
  const targetProdGroup = document.getElementById('target-prod-group');
  scopeSelect.addEventListener('change', () => {
    targetProdGroup.style.display = scopeSelect.value === 'product' ? 'block' : 'none';
  });

  const closeModal = () => { container.innerHTML = ''; };
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);

  document.getElementById('new-disc-form').addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      store.addDiscountRule({
        name: document.getElementById('nd-name').value.trim(),
        code: document.getElementById('nd-code').value.trim().toUpperCase(),
        type: document.getElementById('nd-type').value,
        value: Number(document.getElementById('nd-val').value),
        minQuantity: Number(document.getElementById('nd-min-qty').value || 0),
        minPurchase: Number(document.getElementById('nd-min-purchase').value || 0),
        startDate: document.getElementById('nd-start').value,
        endDate: document.getElementById('nd-end').value,
        maxUsageCount: Number(document.getElementById('nd-max-uses').value || 50),
        scope: document.getElementById('nd-scope').value,
        targetProductId: document.getElementById('nd-scope').value === 'product' ? document.getElementById('nd-target-prod').value : null
      });

      showToast('New discount rule established!', 'success');
      closeModal();
      navigate('discounts');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
