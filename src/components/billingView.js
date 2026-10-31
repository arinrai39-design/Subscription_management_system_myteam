import { store } from '../state/store.js';
import { icons } from '../utils/icons.js';
import { showToast } from '../utils/toast.js';
import confetti from 'canvas-confetti';

let lastBillingRunSummary = null;

export function renderBilling(navigate) {
  const state = store.loadState();
  const subs = state.subscriptions || [];
  const activeSubs = subs.filter(s => s.status === 'Active');
  const todayStr = new Date().toISOString().split('T')[0];

  return `
    <div>
      <div class="sub-navbar">
        <div class="sub-navbar-left">
          <div class="page-title-group">
            <h1>${icons.billing} Automated Billing Day Control Center</h1>
            <span class="page-subtitle">Batch recurring invoicing engine with idempotency guarantees and automatic tax calculations</span>
          </div>
        </div>
        <div class="sub-navbar-actions">
          <div class="benchmark-badge">
            ${icons.check} Idempotency Shield Active: Zero Double-Billing Guarantee
          </div>
        </div>
      </div>

      <div class="main-content">
        <!-- Billing Day Explanatory Card -->
        <div class="card" style="border-left: 4px solid var(--teal); background: #ffffff;">
          <div class="card-body" style="padding: 24px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap: 20px;">
              <div style="max-width: 680px;">
                <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">
                  Recurring Billing Automation
                </h3>
                <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
                  When billing day arrives, Brightloop automatically evaluates all active contracts, applies dynamic volume discount rules, injects tax configurations, and compiles finalized invoices without any manual data entry.
                </p>
                <div style="display:flex; gap: 16px; margin-top: 14px; font-size: 0.8rem;">
                  <span style="color: var(--teal); font-weight: 600;">✓ Automated Customer Pre-fill</span>
                  <span style="color: var(--teal); font-weight: 600;">✓ Strict Anti-Duplicate Guard</span>
                  <span style="color: var(--teal); font-weight: 600;">✓ Automated Email Dispatch</span>
                </div>
              </div>

              <!-- Action Card to Run Billing -->
              <div style="background: #f8fafc; border: 1px solid var(--border-medium); border-radius: var(--radius-md); padding: 18px 22px; width: 340px;">
                <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 10px; color: var(--text-main);">
                  Execute Billing Run
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                  <label class="form-label">Billing Date Cycle</label>
                  <input type="date" class="form-control" id="billing-cycle-date" value="${todayStr}" />
                </div>
                <button class="btn btn-teal btn-lg" id="btn-execute-billing-day" style="width: 100%;">
                  ${icons.billing} Run Automated Billing Day
                </button>
                <div style="font-size: 0.725rem; color: var(--text-dim); text-align: center; margin-top: 8px;">
                  Targeting ${activeSubs.length} active subscription contracts
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Last Run Summary (if executed) -->
        ${lastBillingRunSummary ? `
          <div class="card" style="border: 2px solid var(--teal); background: #f0fdfa; margin-bottom: 24px;">
            <div class="card-header" style="background: transparent; border-bottom: 1px solid #ccfbf1;">
              <div style="display:flex; align-items:center; gap: 8px; font-weight: 700; color: #0f766e;">
                ${icons.check} Billing Day Batch Execution Completed
              </div>
              <span style="font-size: 0.775rem; color: #0d9488;">Cycle: ${lastBillingRunSummary.targetDate}</span>
            </div>
            <div class="card-body">
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
                <div>
                  <span style="font-size: 0.75rem; color: #0d9488; text-transform:uppercase; font-weight:600;">Invoices Generated</span>
                  <div style="font-size: 1.5rem; font-weight: 800; color: #115e59;">${lastBillingRunSummary.generatedCount}</div>
                </div>
                <div>
                  <span style="font-size: 0.75rem; color: #0d9488; text-transform:uppercase; font-weight:600;">Total Amount Billed</span>
                  <div style="font-size: 1.5rem; font-weight: 800; color: #115e59;">$${lastBillingRunSummary.totalBilled.toFixed(2)}</div>
                </div>
                <div>
                  <span style="font-size: 0.75rem; color: #0d9488; text-transform:uppercase; font-weight:600;">Protected (Skipped)</span>
                  <div style="font-size: 1.5rem; font-weight: 800; color: #115e59;">${lastBillingRunSummary.skippedCount}</div>
                  <div style="font-size: 0.725rem; color: #0d9488;">Prevented duplicate billing</div>
                </div>
              </div>

              ${lastBillingRunSummary.generatedInvoices.length > 0 ? `
                <div style="background: #ffffff; border-radius: var(--radius-sm); border: 1px solid #ccfbf1; padding: 12px;">
                  <div style="font-size: 0.775rem; font-weight: 700; color: #0f766e; margin-bottom: 8px;">
                    Generated Invoice Batch:
                  </div>
                  <div style="display:flex; flex-wrap:wrap; gap: 8px;">
                    ${lastBillingRunSummary.generatedInvoices.map(inv => `
                      <button class="btn btn-secondary btn-sm btn-view-batch-inv" data-id="${inv.id}" style="border-color: #99f6e4;">
                        ${inv.number} ($${inv.total.toFixed(2)}) &rarr;
                      </button>
                    `).join('')}
                  </div>
                </div>
              ` : `
                <div style="font-size: 0.825rem; color: #0f766e;">
                  All active contracts have already been invoiced for this period. No duplicate charges were made.
                </div>
              `}
            </div>
          </div>
        ` : ''}

        <!-- Active Subscriptions In Scope Table -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Subscriptions in Billing Scope (${activeSubs.length})</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Status: Active contracts undergoing recurring schedule</span>
          </div>
          <div class="card-body" style="padding: 0;">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Subscription #</th>
                    <th>Customer Name</th>
                    <th>Billing Frequency</th>
                    <th>Last Billed</th>
                    <th>Next Scheduled Cycle</th>
                    <th>Recurring Baseline</th>
                    <th style="text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${activeSubs.length === 0 ? `
                    <tr>
                      <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">
                        No subscriptions currently in Active status. Activate a quotation or confirmed subscription to enable automated billing.
                      </td>
                    </tr>
                  ` : activeSubs.map(sub => {
                    const plan = state.plans.find(p => p.id === sub.planId);
                    const subtotal = sub.lines.reduce((sum, l) => sum + (Number(l.quantity) * Number(l.unitPrice)), 0);

                    return `
                      <tr>
                        <td><strong>${sub.number}</strong></td>
                        <td>
                          <div style="font-weight: 600;">${sub.customerName}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">${sub.companyName}</div>
                        </td>
                        <td>
                          <span class="badge badge-active">${plan ? plan.billingFrequency.toUpperCase() : 'MONTHLY'}</span>
                        </td>
                        <td>${sub.lastBilledDate || '<span style="color:var(--text-dim);">Never billed</span>'}</td>
                        <td>
                          <strong>${sub.nextBillingDate || todayStr}</strong>
                        </td>
                        <td style="font-weight: 700; color: var(--primary);">$${subtotal.toFixed(2)}</td>
                        <td style="text-align: right;">
                          <button class="btn btn-secondary btn-sm btn-bill-single" data-id="${sub.id}">
                            Bill Immediately
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

export function bindBillingEvents(navigate) {
  const btnRun = document.getElementById('btn-execute-billing-day');
  if (btnRun) {
    btnRun.addEventListener('click', () => {
      const dateInput = document.getElementById('billing-cycle-date');
      const targetDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

      btnRun.disabled = true;
      btnRun.innerHTML = `<span style="display:inline-block; animation: spin 1s infinite linear;">&#9696;</span> Generating Invoices...`;

      setTimeout(() => {
        try {
          const result = store.runBillingDay(targetDate);
          lastBillingRunSummary = result;

          if (result.generatedCount > 0) {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            showToast(`Billing Day Success: Generated ${result.generatedCount} invoices totaling $${result.totalBilled.toFixed(2)}!`, 'success');
          } else {
            showToast(`Billing Run complete. 0 invoices generated (${result.skippedCount} subscriptions already billed for cycle).`, 'info');
          }
          navigate('billing');
        } catch (err) {
          showToast(err.message, 'error');
          btnRun.disabled = false;
        }
      }, 500);
    });
  }

  // Single bill trigger
  document.querySelectorAll('.btn-bill-single').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const subId = e.currentTarget.getAttribute('data-id');
      const state = store.loadState();
      const sub = state.subscriptions.find(s => s.id === subId);
      if (sub) {
        const inv = store.generateInvoiceFromSub(sub);
        showToast(`Invoice ${inv.number} generated for ${sub.customerName}!`, 'success');
        navigate('invoices', { invoiceId: inv.id });
      }
    });
  });

  // Batch invoice view buttons
  document.querySelectorAll('.btn-view-batch-inv').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const invId = e.currentTarget.getAttribute('data-id');
      navigate('invoices', { invoiceId: invId });
    });
  });
}
