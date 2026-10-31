import { store } from '../state/store.js';
import { icons } from '../utils/icons.js';
import { showToast } from '../utils/toast.js';

export function renderTemplates(navigate) {
  const state = store.loadState();
  const templates = state.quotationTemplates || [];
  const plans = state.plans || [];
  const products = state.products || [];

  return `
    <div>
      <div class="sub-navbar">
        <div class="sub-navbar-left">
          <div class="page-title-group">
            <h1>${icons.template} Quotation Templates</h1>
            <span class="page-subtitle">Pre-configured bundles, plans, and line items for rapid sales offers</span>
          </div>
        </div>
        <div class="sub-navbar-actions">
          <button class="btn btn-primary btn-sm" id="btn-create-template">
            ${icons.plus} New Quotation Template
          </button>
        </div>
      </div>

      <div class="main-content">
        <!-- Info Banner explaining Scene 3 -->
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-md); padding: 16px 20px; margin-bottom: 24px; display:flex; gap: 14px; align-items:center;">
          <div style="color: #2563eb;">${icons.template}</div>
          <div style="font-size: 0.85rem; color: #1e40af;">
            <strong>Sales Accelerator:</strong> Instead of building offers from scratch, sales reps start from pre-configured quotation templates that bundle the right plan, product variants, and lines with automated validity durations.
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px;">
          ${templates.map(tmpl => {
            const plan = plans.find(p => p.id === tmpl.planId);
            const templateSubtotal = tmpl.lines.reduce((sum, l) => sum + (Number(l.quantity) * Number(l.unitPrice)), 0);

            return `
              <div class="card" style="margin-bottom:0; display:flex; flex-direction:column;">
                <div class="card-header">
                  <div>
                    <h3 class="card-title" style="font-size: 1.05rem;">${tmpl.name}</h3>
                    <span style="font-size: 0.775rem; color: var(--text-muted);">
                      Valid for <strong>${tmpl.validityDays} days</strong> from issuance
                    </span>
                  </div>
                  <span class="badge badge-quotation">${plan ? plan.billingFrequency.toUpperCase() : 'PLAN'}</span>
                </div>
                <div class="card-body" style="flex:1;">
                  <div style="margin-bottom: 12px; font-size: 0.825rem; color: var(--text-muted);">
                    Plan: <strong>${plan ? plan.name : 'Unknown'}</strong> &bull; Baseline: <strong>$${templateSubtotal.toLocaleString()}/cycle</strong>
                  </div>

                  <div style="background: #f8fafc; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 16px;">
                    <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">
                      Included Order Lines (${tmpl.lines.length})
                    </div>
                    <div style="display:flex; flex-direction:column; gap: 6px; font-size: 0.8rem;">
                      ${tmpl.lines.map(l => {
                        const prod = products.find(p => p.id === l.productId);
                        const variant = prod ? prod.variants.find(v => v.id === l.variantId) : null;
                        return `
                          <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span>
                              <strong>${l.quantity}x</strong> ${prod ? prod.name : 'Product'}
                              ${variant && variant.extraPrice > 0 ? `<em style="color:var(--primary); font-size: 0.75rem;">(${variant.name})</em>` : ''}
                            </span>
                            <span style="font-weight: 600;">$${(l.quantity * l.unitPrice).toFixed(2)}</span>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>

                  <p style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">
                    "${tmpl.notes || 'No notes'}"
                  </p>
                </div>
                <div style="padding: 14px 20px; background: #fafbfc; border-top: 1px solid var(--border-light); display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size: 0.775rem; color: var(--text-dim);">Template ID: ${tmpl.id}</span>
                  <button class="btn btn-teal btn-sm btn-use-template" data-id="${tmpl.id}">
                    ${icons.zap} Create Quotation Offer &rarr;
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

export function bindTemplateEvents(navigate) {
  // Use template button
  document.querySelectorAll('.btn-use-template').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tmplId = e.currentTarget.getAttribute('data-id');
      openInstantiateModal(tmplId, navigate);
    });
  });

  const btnCreate = document.getElementById('btn-create-template');
  if (btnCreate) {
    btnCreate.addEventListener('click', () => {
      showToast('Quotation template designer loaded with default lines.', 'info');
    });
  }
}

function openInstantiateModal(templateId, navigate) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  const state = store.loadState();
  const template = state.quotationTemplates.find(t => t.id === templateId);
  const customers = state.users.filter(u => u.role === 'customer');

  container.innerHTML = `
    <div class="modal-backdrop" id="instantiate-modal-backdrop">
      <div class="modal-content modal-content-sm">
        <div class="modal-header">
          <div class="modal-title">
            <span style="color: var(--teal);">${icons.zap}</span>
            Generate Offer from Template
          </div>
          <button class="modal-close-btn" id="modal-close">&times;</button>
        </div>
        <form id="instantiate-form">
          <div class="modal-body">
            <div style="background: #f8fafc; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 16px;">
              <div style="font-weight: 700; color: var(--text-main);">${template.name}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                Validity: <strong>${template.validityDays} days</strong> &bull; Lines: <strong>${template.lines.length} items</strong>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Select Target Customer <span class="required">*</span></label>
              <select class="form-control form-select" id="target-customer" required>
                ${customers.map(c => `
                  <option value="${c.id}">${c.name} (${c.companyName || c.email})</option>
                `).join('')}
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="modal-cancel">Cancel</button>
            <button type="submit" class="btn btn-teal">
              Generate & Open Quotation
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const closeModal = () => { container.innerHTML = ''; };
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);

  document.getElementById('instantiate-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const customerId = document.getElementById('target-customer').value;
    try {
      const newSub = store.createSubscriptionFromTemplate(templateId, customerId);
      showToast(`Quotation ${newSub.number} created from template! Valid for ${template.validityDays} days.`, 'success');
      closeModal();
      navigate('subscriptions', { subId: newSub.id });
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
