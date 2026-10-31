import { store } from '../state/store.js';
import { icons } from '../utils/icons.js';
import { showToast } from '../utils/toast.js';

let activeSubTab = 'products'; // 'products' | 'plans'

export function renderProductsAndPlans(navigate) {
  const state = store.loadState();
  const products = state.products || [];
  const plans = state.plans || [];
  const currentUser = state.currentUser;
  const isAdmin = currentUser.role === 'admin';

  return `
    <div>
      <div class="sub-navbar">
        <div class="sub-navbar-left">
          <div class="page-title-group">
            <h1>${icons.products} Products, Variants & Subscription Plans</h1>
            <span class="page-subtitle">Configure software offerings, brand variants, billing cadences, and lifecycle policies</span>
          </div>
        </div>
        <div class="sub-navbar-actions">
          ${isAdmin ? `
            ${activeSubTab === 'products' ? `
              <button class="btn btn-primary btn-sm" id="btn-add-product">
                ${icons.plus} New Product & Variant
              </button>
            ` : `
              <button class="btn btn-primary btn-sm" id="btn-add-plan">
                ${icons.plus} New Subscription Plan
              </button>
            `}
          ` : `
            <span class="badge badge-draft">Read-only Catalog Mode</span>
          `}
        </div>
      </div>

      <div class="main-content">
        <!-- Sub-tabs switcher -->
        <div style="display:flex; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid var(--border-light); padding-bottom: 8px;">
          <button class="btn ${activeSubTab === 'products' ? 'btn-primary' : 'btn-secondary'} btn-sm sub-nav-tab" data-subtab="products">
            ${icons.products} Products & Variants (${products.length})
          </button>
          <button class="btn ${activeSubTab === 'plans' ? 'btn-primary' : 'btn-secondary'} btn-sm sub-nav-tab" data-subtab="plans">
            ${icons.plans} Subscription Plans & Lifecycle Policies (${plans.length})
          </button>
        </div>

        ${activeSubTab === 'products' ? `
          <!-- PRODUCTS LIST -->
          <div style="background: #f8fafc; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 16px 20px; margin-bottom: 24px; font-size: 0.85rem; color: var(--text-muted);">
            <strong>Product Variants Engine:</strong> Products support dynamic variants (such as brand editions). For example, selecting the <strong>Odoo Enterprise Brand</strong> adds <strong>+$560</strong> directly to the subscription line item pricing.
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px;">
            ${products.map(p => {
              const margin = p.costPrice ? Math.round(((p.salesPrice - p.costPrice) / p.salesPrice) * 100) : 100;

              return `
                <div class="card" style="margin-bottom:0;">
                  <div class="card-header">
                    <div>
                      <h3 class="card-title" style="font-size: 1.05rem;">${p.name}</h3>
                      <span class="badge" style="background:#e0f2fe; color:#0369a1; margin-top:3px;">${p.type}</span>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">$${p.salesPrice.toFixed(2)}</div>
                      <div style="font-size: 0.725rem; color: var(--text-dim);">Cost: $${p.costPrice || 0} (${margin}% Margin)</div>
                    </div>
                  </div>
                  <div class="card-body">
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 14px; min-height: 38px;">
                      ${p.notes || 'No description provided.'}
                    </p>

                    <div style="border-top: 1px solid var(--border-light); padding-top: 10px;">
                      <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
                        Available Variants (${p.variants ? p.variants.length : 0})
                      </span>
                      <div style="display:flex; flex-direction:column; gap: 6px; margin-top: 8px;">
                        ${(p.variants || []).map(v => `
                          <div style="display:flex; justify-content:space-between; align-items:center; background: #f8fafc; border: 1px solid var(--border-light); padding: 6px 10px; border-radius: var(--radius-xs); font-size: 0.8rem;">
                            <span style="font-weight: 500;">
                              ${v.name}
                              ${v.name.includes('Odoo') ? `<span class="badge" style="background:var(--primary-subtle); color:var(--primary); font-size:0.68rem; margin-left:4px;">ODOO BRAND</span>` : ''}
                            </span>
                            <span style="font-weight: 700; color: ${v.extraPrice > 0 ? 'var(--teal)' : 'var(--text-muted)'};">
                              ${v.extraPrice > 0 ? `+$${v.extraPrice.toFixed(2)}` : 'Base Price'}
                            </span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <!-- PLANS LIST -->
          <div style="background: #f8fafc; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 16px 20px; margin-bottom: 24px; font-size: 0.85rem; color: var(--text-muted);">
            <strong>Plan-by-Plan Lifecycle Decisions:</strong> The admin sets frequency (daily, weekly, monthly, yearly), minimum quantity, and explicit lifecycle rules—some close on their own when they end, while others can be closed early, paused, or renewed.
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px;">
            ${plans.map(plan => {
              const r = plan.rules || {};
              return `
                <div class="card" style="margin-bottom:0;">
                  <div class="card-header">
                    <div>
                      <h3 class="card-title" style="font-size: 1.05rem;">${plan.name}</h3>
                      <span class="badge badge-active" style="text-transform:uppercase; margin-top:3px;">
                        ${plan.billingFrequency}
                      </span>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 1.35rem; font-weight: 800; color: var(--primary);">$${plan.price.toFixed(2)}</div>
                      <div style="font-size: 0.725rem; color: var(--text-dim);">Min Quantity: ${plan.minQuantity || 1}</div>
                    </div>
                  </div>
                  <div class="card-body">
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">
                      Available: <strong>${plan.availableFrom || '2026-01-01'}</strong> to <strong>${plan.availableTo || 'Indefinite'}</strong>
                    </div>

                    <div style="border-top: 1px solid var(--border-light); padding-top: 12px;">
                      <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
                        Configured Lifecycle Rules
                      </span>
                      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; font-size: 0.775rem;">
                        <div style="display:flex; align-items:center; gap: 6px; color: ${r.autoCloseOnEnd ? '#16a34a' : 'var(--text-dim)'};">
                          <span>${r.autoCloseOnEnd ? '✓' : '✗'}</span> Auto-Close at End
                        </div>
                        <div style="display:flex; align-items:center; gap: 6px; color: ${r.allowEarlyClose ? '#16a34a' : 'var(--text-dim)'};">
                          <span>${r.allowEarlyClose ? '✓' : '✗'}</span> Allow Early Close
                        </div>
                        <div style="display:flex; align-items:center; gap: 6px; color: ${r.allowPause ? '#16a34a' : 'var(--text-dim)'};">
                          <span>${r.allowPause ? '✓' : '✗'}</span> Allow Pausing
                        </div>
                        <div style="display:flex; align-items:center; gap: 6px; color: ${r.allowRenewal ? '#16a34a' : 'var(--text-dim)'};">
                          <span>${r.allowRenewal ? '✓' : '✗'}</span> Allow Renewal
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

export function bindProductAndPlanEvents(navigate) {
  document.querySelectorAll('.sub-nav-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeSubTab = e.currentTarget.getAttribute('data-subtab');
      navigate('products');
    });
  });

  const btnAddProd = document.getElementById('btn-add-product');
  if (btnAddProd) {
    btnAddProd.addEventListener('click', () => openNewProductModal(navigate));
  }

  const btnAddPlan = document.getElementById('btn-add-plan');
  if (btnAddPlan) {
    btnAddPlan.addEventListener('click', () => openNewPlanModal(navigate));
  }
}

function openNewProductModal(navigate) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  container.innerHTML = `
    <div class="modal-backdrop" id="new-prod-modal-backdrop">
      <div class="modal-content modal-content-sm">
        <div class="modal-header">
          <div class="modal-title">
            <span style="color: var(--primary);">${icons.products}</span>
            Launch New Product
          </div>
          <button class="modal-close-btn" id="modal-close">&times;</button>
        </div>
        <form id="new-prod-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Product Name <span class="required">*</span></label>
              <input type="text" class="form-control" id="np-name" placeholder="e.g. Brightloop AI Copilot" required />
            </div>

            <div class="form-group">
              <label class="form-label">Product Type <span class="required">*</span></label>
              <select class="form-control form-select" id="np-type">
                <option value="Software">Software</option>
                <option value="Add-on">Add-on</option>
                <option value="Service">Service</option>
                <option value="Consumable">Consumable</option>
              </select>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Sales Price ($) <span class="required">*</span></label>
                <input type="number" step="0.01" class="form-control" id="np-sales-price" placeholder="1400" required />
              </div>
              <div class="form-group">
                <label class="form-label">Cost Price ($)</label>
                <input type="number" step="0.01" class="form-control" id="np-cost-price" placeholder="350" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Product Variant (e.g. Brand Edition)</label>
              <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 8px;">
                <input type="text" class="form-control" id="np-variant-name" value="Odoo Enterprise Brand" placeholder="Variant name" />
                <input type="number" step="0.01" class="form-control" id="np-variant-price" value="560" placeholder="+Price" />
              </div>
              <div style="font-size: 0.725rem; color: var(--text-dim); margin-top: 3px;">
                Choosing this brand variant adds to the sales price (e.g. +$560).
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Notes & Specifications</label>
              <textarea class="form-control" id="np-notes" rows="2" placeholder="Key SLA features and description..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="modal-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const closeModal = () => { container.innerHTML = ''; };
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);

  document.getElementById('new-prod-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('np-name').value.trim();
    const type = document.getElementById('np-type').value;
    const salesPrice = Number(document.getElementById('np-sales-price').value);
    const costPrice = Number(document.getElementById('np-cost-price').value || 0);
    const varName = document.getElementById('np-variant-name').value.trim();
    const varPrice = Number(document.getElementById('np-variant-price').value || 0);
    const notes = document.getElementById('np-notes').value.trim();

    store.addProduct({
      name,
      type,
      salesPrice,
      costPrice,
      notes,
      variants: [
        { id: 'var-std-' + Date.now(), name: 'Standard Edition', extraPrice: 0 },
        ...(varName ? [{ id: 'var-custom-' + Date.now(), name: varName, extraPrice: varPrice }] : [])
      ]
    });

    showToast(`Product "${name}" launched with variants!`, 'success');
    closeModal();
    navigate('products');
  });
}

function openNewPlanModal(navigate) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  container.innerHTML = `
    <div class="modal-backdrop" id="new-plan-modal-backdrop">
      <div class="modal-content modal-content-sm">
        <div class="modal-header">
          <div class="modal-title">
            <span style="color: var(--teal);">${icons.plans}</span>
            Create Subscription Plan
          </div>
          <button class="modal-close-btn" id="modal-close">&times;</button>
        </div>
        <form id="new-plan-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Plan Name <span class="required">*</span></label>
              <input type="text" class="form-control" id="npl-name" placeholder="e.g. Semi-Annual Growth Pass" required />
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Billing Frequency <span class="required">*</span></label>
                <select class="form-control form-select" id="npl-freq">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Plan Base Price ($) <span class="required">*</span></label>
                <input type="number" step="0.01" class="form-control" id="npl-price" placeholder="1400" required />
              </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Minimum Quantity (Seats)</label>
                <input type="number" class="form-control" id="npl-min-qty" value="1" min="1" />
              </div>

              <div class="form-group">
                <label class="form-label">Available Until Date</label>
                <input type="date" class="form-control" id="npl-avail-to" value="2027-12-31" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" style="margin-bottom:8px;">Plan Lifecycle Policies</label>
              <div style="display:flex; flex-direction:column; gap: 6px; font-size: 0.825rem;">
                <label style="display:flex; align-items:center; gap: 8px;">
                  <input type="checkbox" id="npl-rule-autoclose" checked />
                  Auto-close on end date (closes on its own when contract ends)
                </label>
                <label style="display:flex; align-items:center; gap: 8px;">
                  <input type="checkbox" id="npl-rule-earlyclose" checked />
                  Can be closed early by customer or staff
                </label>
                <label style="display:flex; align-items:center; gap: 8px;">
                  <input type="checkbox" id="npl-rule-pause" checked />
                  Can be paused and resumed
                </label>
                <label style="display:flex; align-items:center; gap: 8px;">
                  <input type="checkbox" id="npl-rule-renewal" checked />
                  Can be renewed upon term expiration
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="modal-cancel">Cancel</button>
            <button type="submit" class="btn btn-teal">Save Plan</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const closeModal = () => { container.innerHTML = ''; };
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);

  document.getElementById('new-plan-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('npl-name').value.trim();
    const billingFrequency = document.getElementById('npl-freq').value;
    const price = Number(document.getElementById('npl-price').value);
    const minQuantity = Number(document.getElementById('npl-min-qty').value || 1);
    const availableTo = document.getElementById('npl-avail-to').value;

    const rules = {
      autoCloseOnEnd: document.getElementById('npl-rule-autoclose').checked,
      allowEarlyClose: document.getElementById('npl-rule-earlyclose').checked,
      allowPause: document.getElementById('npl-rule-pause').checked,
      allowRenewal: document.getElementById('npl-rule-renewal').checked
    };

    store.addPlan({
      name,
      billingFrequency,
      price,
      minQuantity,
      availableFrom: new Date().toISOString().split('T')[0],
      availableTo,
      rules
    });

    showToast(`Plan "${name}" created with configured lifecycle rules!`, 'success');
    closeModal();
    navigate('products');
  });
}
