import { store } from '../state/store.js';
import { icons } from '../utils/icons.js';
import { showToast } from '../utils/toast.js';
import { openPaymentModal } from './paymentsModal.js';
import { openResetPasswordModal } from './authModal.js';

let activePortalTab = 'subscriptions'; // 'subscriptions' | 'invoices'

export function renderCustomerPortal(navigate) {
  const state = store.loadState();
  const currentUser = state.currentUser;

  // Filter subscriptions and invoices strictly for this customer
  const mySubs = (state.subscriptions || []).filter(s => s.customerId === currentUser.id);
  const myInvoices = (state.invoices || []).filter(i => i.customerId === currentUser.id);
  const plans = state.plans || [];
  const products = state.products || [];

  return `
    <div>
      <!-- Customer Portal Top Banner -->
      <div class="sub-navbar">
        <div class="sub-navbar-left">
          <div class="page-title-group">
            <h1>${icons.portal} Brightloop Customer Self-Service Portal</h1>
            <span class="page-subtitle">Welcome back, <strong>${currentUser.name}</strong> (${currentUser.companyName || currentUser.email})</span>
          </div>
        </div>
        <div class="sub-navbar-actions">
          <button class="btn btn-secondary btn-sm" id="btn-change-password">
            ${icons.zap} Change Password
          </button>
        </div>
      </div>

      <div class="main-content">
        <!-- Self-Service Notice -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: 16px 20px; margin-bottom: 24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: 12px;">
          <div>
            <div style="font-weight: 700; color: #166534; font-size: 0.95rem;">
              Full Self-Service Control Center
            </div>
            <div style="font-size: 0.825rem; color: #15803d; margin-top: 2px;">
              Manage your active software contracts, review billing history, remit payments, or pause service without having to email support.
            </div>
          </div>
          <div style="font-size: 0.8rem; color: #166534; font-weight: 600;">
            Account ID: <code>${currentUser.id}</code>
          </div>
        </div>

        <!-- Portal Tabs -->
        <div style="display:flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid var(--border-light); padding-bottom: 8px;">
          <button class="btn ${activePortalTab === 'subscriptions' ? 'btn-primary' : 'btn-secondary'} btn-sm portal-nav-tab" data-tab="subscriptions">
            ${icons.subscription} My Subscriptions (${mySubs.length})
          </button>
          <button class="btn ${activePortalTab === 'invoices' ? 'btn-primary' : 'btn-secondary'} btn-sm portal-nav-tab" data-tab="invoices">
            ${icons.invoice} My Invoices & Payments (${myInvoices.length})
          </button>
        </div>

        ${activePortalTab === 'subscriptions' ? `
          <!-- MY SUBSCRIPTIONS -->
          <div style="display:flex; flex-direction:column; gap: 20px;">
            ${mySubs.length === 0 ? `
              <div class="card">
                <div class="card-body" style="text-align: center; padding: 48px; color: var(--text-muted);">
                  ${icons.subscription}
                  <p style="margin-top: 8px;">You currently have no subscriptions associated with this account.</p>
                </div>
              </div>
            ` : mySubs.map(sub => {
              const plan = plans.find(p => p.id === sub.planId);
              const r = plan ? plan.rules : { allowPause: true, allowEarlyClose: true, allowRenewal: true };
              const subtotal = sub.lines.reduce((sum, l) => sum + (Number(l.quantity) * Number(l.unitPrice)), 0);

              return `
                <div class="card">
                  <div class="card-header">
                    <div>
                      <div style="display:flex; align-items:center; gap: 10px;">
                        <h3 class="card-title">${sub.number}</h3>
                        <span class="badge badge-${sub.status.toLowerCase()}">${sub.status}</span>
                      </div>
                      <span style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; display:block;">
                        Plan: <strong>${plan ? plan.name : 'Custom Plan'}</strong> (${plan ? plan.billingFrequency.toUpperCase() : ''})
                      </span>
                    </div>

                    <div style="display:flex; gap: 8px; flex-wrap: wrap;">
                      ${sub.status === 'Active' && r.allowPause ? `
                        <button class="btn btn-secondary btn-sm btn-cust-pause" data-id="${sub.id}" style="color: #c2410c;">
                          ${icons.pause} Pause Service
                        </button>
                      ` : ''}

                      ${sub.status === 'Paused' ? `
                        <button class="btn btn-teal btn-sm btn-cust-resume" data-id="${sub.id}">
                          ${icons.play} Resume Service
                        </button>
                      ` : ''}

                      ${sub.status === 'Active' && r.allowEarlyClose ? `
                        <button class="btn btn-outline-danger btn-sm btn-cust-close" data-id="${sub.id}">
                          Cancel Subscription
                        </button>
                      ` : ''}

                      ${r.allowRenewal ? `
                        <button class="btn btn-secondary btn-sm btn-cust-renew" data-id="${sub.id}">
                          ${icons.rotate} Renew
                        </button>
                      ` : ''}
                    </div>
                  </div>

                  <div class="card-body">
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; font-size: 0.85rem;">
                      <div>
                        <span class="form-label">Next Scheduled Billing</span>
                        <div style="font-weight: 700; color: var(--text-main); margin-top: 2px;">
                          ${sub.nextBillingDate || 'Pending next cycle'}
                        </div>
                      </div>
                      <div>
                        <span class="form-label">Term Expiration</span>
                        <div style="font-weight: 600; color: var(--text-main); margin-top: 2px;">
                          ${sub.expiryDate || 'Continuous'}
                        </div>
                      </div>
                      <div>
                        <span class="form-label">Recurring Amount</span>
                        <div style="font-weight: 800; color: var(--primary); font-size: 1.1rem; margin-top: 2px;">
                          $${subtotal.toFixed(2)} / ${plan ? plan.billingFrequency : 'cycle'}
                        </div>
                      </div>
                    </div>

                    <!-- Line items list -->
                    <div style="background: #f8fafc; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 12px;">
                      <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">
                        Contracted Software Modules (${sub.lines.length})
                      </div>
                      <div style="display:flex; flex-direction:column; gap: 6px; font-size: 0.825rem;">
                        ${sub.lines.map(line => {
                          const prod = products.find(p => p.id === line.productId);
                          const variant = prod ? prod.variants.find(v => v.id === line.variantId) : null;
                          return `
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                              <span>
                                <strong>${line.quantity}x</strong> ${prod ? prod.name : 'Module'}
                                ${variant && variant.extraPrice > 0 ? `<em style="color:var(--primary);">(${variant.name})</em>` : ''}
                              </span>
                              <span style="font-weight: 600;">$${(line.quantity * line.unitPrice).toFixed(2)}</span>
                            </div>
                          `;
                        }).join('')}
                      </div>
                    </div>
                  </div>
                </div>
              `;
            })}
          </div>
        ` : `
          <!-- MY INVOICES -->
          <div class="card">
            <div class="card-body" style="padding: 0;">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Billing Period</th>
                      <th>Invoice Date</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Total Amount</th>
                      <th>Amount Paid</th>
                      <th>Balance</th>
                      <th style="text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${myInvoices.length === 0 ? `
                      <tr>
                        <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
                          No invoices have been issued to your account yet.
                        </td>
                      </tr>
                    ` : myInvoices.map(inv => {
                      const balance = Math.max(0, Number(inv.total) - Number(inv.amountPaid || 0));
                      const isPaid = inv.status === 'Paid' || balance === 0;

                      return `
                        <tr>
                          <td><strong>${inv.number}</strong></td>
                          <td>${inv.billingPeriod || '-'}</td>
                          <td>${inv.invoiceDate}</td>
                          <td>${inv.dueDate}</td>
                          <td>
                            <span class="badge ${isPaid ? 'badge-paid' : 'badge-confirmed'}">
                              ${isPaid ? 'Paid' : 'Due'}
                            </span>
                          </td>
                          <td style="font-weight: 600;">$${Number(inv.total).toFixed(2)}</td>
                          <td style="color: #16a34a; font-weight: 600;">$${Number(inv.amountPaid || 0).toFixed(2)}</td>
                          <td style="font-weight: 700; color: ${balance > 0 ? '#dc2626' : '#16a34a'};">
                            $${balance.toFixed(2)}
                          </td>
                          <td style="text-align: right;">
                            ${balance > 0 ? `
                              <button class="btn btn-teal btn-sm btn-cust-pay-online" data-id="${inv.id}">
                                ${icons.payment} Pay Online
                              </button>
                            ` : ''}
                            <button class="btn btn-secondary btn-sm btn-cust-print-inv" data-id="${inv.id}">
                              ${icons.print} View / Print
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
        `}
      </div>
    </div>
  `;
}

export function bindCustomerPortalEvents(navigate) {
  document.querySelectorAll('.portal-nav-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activePortalTab = e.currentTarget.getAttribute('data-tab');
      navigate('customer-portal');
    });
  });

  // Change password
  const btnChangePw = document.getElementById('btn-change-password');
  if (btnChangePw) {
    btnChangePw.addEventListener('click', () => {
      openResetPasswordModal('');
    });
  }

  // Self-service Pause
  document.querySelectorAll('.btn-cust-pause').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm('Pause this subscription? Your recurring billing will be put on hold until you resume.')) {
        try {
          store.updateSubscriptionStatus(id, 'Paused', 'Customer self-service temporary pause');
          showToast('Your subscription is now paused.', 'info');
          navigate('customer-portal');
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  });

  // Self-service Resume
  document.querySelectorAll('.btn-cust-resume').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      try {
        store.updateSubscriptionStatus(id, 'Active');
        showToast('Your subscription has been resumed!', 'success');
        navigate('customer-portal');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // Self-service Close
  document.querySelectorAll('.btn-cust-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm('Are you sure you want to cancel this subscription?')) {
        try {
          store.updateSubscriptionStatus(id, 'Closed', 'Customer self-service cancellation');
          showToast('Your subscription has been cancelled.', 'info');
          navigate('customer-portal');
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  });

  // Self-service Renew
  document.querySelectorAll('.btn-cust-renew').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      try {
        const sub = store.renewSubscription(id);
        showToast(`Subscription renewed! Extended to ${sub.expiryDate}.`, 'success');
        navigate('customer-portal');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // Pay online
  document.querySelectorAll('.btn-cust-pay-online').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const invId = e.currentTarget.getAttribute('data-id');
      openPaymentModal(invId, () => {
        navigate('customer-portal');
      });
    });
  });

  // Print invoice
  document.querySelectorAll('.btn-cust-print-inv').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const invId = e.currentTarget.getAttribute('data-id');
      navigate('invoices', { invoiceId: invId });
    });
  });
}
