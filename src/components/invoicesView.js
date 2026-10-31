import { store } from '../state/store.js';
import { icons } from '../utils/icons.js';
import { showToast } from '../utils/toast.js';
import { openPaymentModal } from './paymentsModal.js';

let currentInvoiceFilter = 'ALL';
let currentSelectedInvoiceId = null;

export function renderInvoices(navigate, initialInvId = null) {
  if (initialInvId) {
    currentSelectedInvoiceId = initialInvId;
  }

  const state = store.loadState();
  const invoices = state.invoices || [];
  const todayStr = new Date().toISOString().split('T')[0];

  if (currentSelectedInvoiceId) {
    const inv = invoices.find(i => i.id === currentSelectedInvoiceId);
    if (inv) {
      return renderInvoiceDetail(inv, navigate);
    }
  }

  // Filter
  let filtered = invoices;
  if (currentInvoiceFilter === 'OVERDUE') {
    filtered = invoices.filter(i => {
      const balance = Number(i.total) - Number(i.amountPaid || 0);
      return (i.status === 'Confirmed' || i.status === 'Draft') && i.dueDate && i.dueDate < todayStr && balance > 0;
    });
  } else if (currentInvoiceFilter !== 'ALL') {
    filtered = invoices.filter(i => i.status.toUpperCase() === currentInvoiceFilter);
  }

  const overdueCount = invoices.filter(i => {
    const balance = Number(i.total) - Number(i.amountPaid || 0);
    return (i.status === 'Confirmed' || i.status === 'Draft') && i.dueDate && i.dueDate < todayStr && balance > 0;
  }).length;

  return `
    <div>
      <div class="sub-navbar">
        <div class="sub-navbar-left">
          <div class="page-title-group">
            <h1>${icons.invoice} Customer Invoices & Receivables</h1>
            <span class="page-subtitle">Track billing lifecycle, record payments, and manage outstanding accounts</span>
          </div>
        </div>
        <div class="sub-navbar-actions">
          <div class="search-box">
            ${icons.search}
            <input type="text" class="form-control" id="search-invoices" placeholder="Search invoice, customer..." />
          </div>
          <button class="btn btn-teal btn-sm" id="btn-goto-billing">
            ${icons.billing} Run Recurring Billing
          </button>
        </div>
      </div>

      <div class="main-content">
        <!-- Filter Tabs -->
        <div style="display:flex; gap: 8px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 4px;">
          ${['ALL', 'DRAFT', 'CONFIRMED', 'PAID', 'OVERDUE'].map(status => {
            let count = 0;
            if (status === 'ALL') count = invoices.length;
            else if (status === 'OVERDUE') count = overdueCount;
            else count = invoices.filter(i => i.status.toUpperCase() === status).length;

            const isActive = currentInvoiceFilter === status;
            return `
              <button class="btn ${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm filter-inv-btn ${status === 'OVERDUE' ? 'btn-outline-danger' : ''}" data-status="${status}">
                ${status === 'OVERDUE' ? `⚠️ Overdue Accounts` : status}
                <span style="opacity: 0.8; font-size: 0.725rem; margin-left: 4px;">(${count})</span>
              </button>
            `;
          }).join('')}
        </div>

        <div class="card">
          <div class="card-body" style="padding: 0;">
            <div class="table-responsive">
              <table class="table table-clickable" id="invoices-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer / Entity</th>
                    <th>Invoice Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Total Billed</th>
                    <th>Amount Paid</th>
                    <th>Balance Due</th>
                    <th style="text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.length === 0 ? `
                    <tr>
                      <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-dim);">
                        No invoices found for this selection.
                      </td>
                    </tr>
                  ` : filtered.map(inv => {
                    const balance = Number(inv.total) - Number(inv.amountPaid || 0);
                    const isOverdue = (inv.status === 'Confirmed' || inv.status === 'Draft') && inv.dueDate && inv.dueDate < todayStr && balance > 0;

                    let badgeClass = `badge-${inv.status.toLowerCase()}`;
                    if (isOverdue) badgeClass = 'badge-overdue';

                    return `
                      <tr class="inv-row" data-id="${inv.id}">
                        <td><strong>${inv.number}</strong></td>
                        <td>
                          <div style="font-weight: 600;">${inv.customerName}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">${inv.companyName || ''}</div>
                        </td>
                        <td>${inv.invoiceDate || '-'}</td>
                        <td>
                          ${inv.dueDate || '-'}
                          ${isOverdue ? `<div style="font-size: 0.7rem; color: #dc2626; font-weight:700;">OVERDUE</div>` : ''}
                        </td>
                        <td>
                          <span class="badge ${badgeClass}">${isOverdue ? 'Overdue' : inv.status}</span>
                        </td>
                        <td style="font-weight: 600;">$${Number(inv.total).toFixed(2)}</td>
                        <td style="color: #16a34a; font-weight: 600;">$${Number(inv.amountPaid || 0).toFixed(2)}</td>
                        <td style="font-weight: 700; color: ${balance > 0 ? '#dc2626' : 'var(--text-muted)'};">
                          $${balance.toFixed(2)}
                        </td>
                        <td style="text-align: right;" onclick="event.stopPropagation();">
                          <button class="btn btn-secondary btn-sm btn-open-inv-detail" data-id="${inv.id}">
                            View Invoice &rarr;
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

function renderInvoiceDetail(inv, navigate) {
  const state = store.loadState();
  const company = state.company;
  const balance = Math.max(0, Number(inv.total) - Number(inv.amountPaid || 0));
  const isPaid = inv.status === 'Paid' || balance === 0;

  return `
    <div>
      <div class="sub-navbar">
        <div class="sub-navbar-left">
          <button class="btn btn-secondary btn-sm" id="btn-back-to-invoices">
            &larr; Back to Invoices
          </button>
          <div class="page-title-group">
            <h1>${inv.number} <span class="badge badge-${inv.status.toLowerCase()}">${inv.status}</span></h1>
            <span class="page-subtitle">Linked Subscription: <strong>${inv.subscriptionNumber || 'N/A'}</strong></span>
          </div>
        </div>

        <div class="sub-navbar-actions">
          <div class="status-pipeline">
            <span class="stage-step ${inv.status === 'Draft' ? 'active' : 'completed'}">Draft</span>
            <span class="stage-separator">&gt;</span>
            <span class="stage-step ${inv.status === 'Confirmed' ? 'active' : inv.status === 'Draft' ? '' : 'completed'}">Confirmed</span>
            <span class="stage-separator">&gt;</span>
            <span class="stage-step ${isPaid ? 'active' : ''}">Paid</span>
          </div>
        </div>
      </div>

      <div class="main-content">
        <!-- Invoices Action Toolbar -->
        <div class="no-print" style="background: #fff; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: 10px;">
          <div style="display:flex; gap: 8px; flex-wrap: wrap;">
            ${inv.status === 'Draft' ? `
              <button class="btn btn-teal btn-sm" id="btn-inv-confirm">
                ${icons.check} Confirm Invoice
              </button>
            ` : ''}

            ${!isPaid && inv.status !== 'Cancelled' ? `
              <button class="btn btn-teal btn-sm" id="btn-inv-pay">
                ${icons.payment} Register Payment
              </button>
            ` : ''}

            <button class="btn btn-secondary btn-sm" id="btn-inv-send">
              ${icons.mail} Send by Email
            </button>

            <button class="btn btn-secondary btn-sm" id="btn-inv-print">
              ${icons.print} Print Invoice
            </button>

            ${inv.status !== 'Cancelled' && !isPaid ? `
              <button class="btn btn-outline-danger btn-sm" id="btn-inv-cancel">
                Cancel
              </button>
            ` : ''}
          </div>

          <div>
            ${isPaid ? `
              <span class="badge badge-paid" style="font-size: 0.85rem; padding: 6px 12px;">
                ${icons.check} Fully Settled & Paid
              </span>
            ` : `
              <span style="font-size: 0.85rem; font-weight: 700; color: #dc2626;">
                Balance Due: $${balance.toFixed(2)}
              </span>
            `}
          </div>
        </div>

        <!-- Clean Formatted Printable Invoice Template -->
        <div class="invoice-preview-container">
          <div class="invoice-header-grid">
            <div class="invoice-company">
              <h2>${company.name}</h2>
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
                ${company.tagline}<br />
                ${company.address}<br />
                ${company.email} &bull; ${company.phone}
              </div>
            </div>
            <div class="invoice-meta-right">
              <div class="invoice-number">${inv.number}</div>
              <div style="font-size: 0.825rem; color: var(--text-muted); margin-top: 6px;">
                Invoice Date: <strong>${inv.invoiceDate}</strong><br />
                Due Date: <strong style="color:${balance > 0 ? '#dc2626' : 'inherit'};">${inv.dueDate}</strong><br />
                Billing Cycle: ${inv.billingPeriod || '-'}
              </div>
            </div>
          </div>

          <div class="invoice-details-box">
            <div>
              <span class="form-label">Invoiced To:</span>
              <div style="font-weight: 700; font-size: 0.95rem; margin-top: 3px;">${inv.customerName}</div>
              <div style="font-size: 0.825rem; color: var(--text-muted);">${inv.companyName || ''}</div>
              <div style="font-size: 0.825rem; color: var(--text-muted); margin-top: 2px;">
                Linked Subscription Contract: <strong>${inv.subscriptionNumber || 'N/A'}</strong>
              </div>
            </div>
            <div>
              <span class="form-label">Payment & Remittance Terms:</span>
              <div style="font-size: 0.825rem; color: var(--text-muted); margin-top: 3px; line-height: 1.5;">
                Electronic Funds Transfer (ACH/Wire) or Credit Card.<br />
                Bank: JPMorgan Chase &bull; Routing: 021000021<br />
                Account: 9482-1092-4418 (Brightloop Software Inc.)
              </div>
            </div>
          </div>

          <!-- Line Items Table -->
          <div class="table-responsive">
            <table class="table table-lines">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="width: 100px;">Quantity</th>
                  <th style="width: 130px;">Unit Price</th>
                  <th style="text-align: right; width: 140px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${inv.lines.map(line => `
                  <tr>
                    <td><strong>${line.description}</strong></td>
                    <td>${line.quantity}</td>
                    <td>$${Number(line.unitPrice).toFixed(2)}</td>
                    <td style="text-align: right; font-weight: 600;">$${Number(line.amount).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Totals Calculation -->
          <div class="invoice-totals-wrapper">
            <table class="invoice-totals-table">
              <tr>
                <td style="color: var(--text-muted);">Untaxed Subtotal:</td>
                <td style="text-align: right; font-weight: 600;">$${Number(inv.subtotal).toFixed(2)}</td>
              </tr>
              ${inv.discountAmount > 0 ? `
                <tr style="color: #16a34a;">
                  <td>Automated Discount:</td>
                  <td style="text-align: right; font-weight: 600;">-$${Number(inv.discountAmount).toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr>
                <td style="color: var(--text-muted);">Taxes Calculated:</td>
                <td style="text-align: right; font-weight: 600;">$${Number(inv.taxAmount).toFixed(2)}</td>
              </tr>
              <tr class="grand-total">
                <td>Invoice Total:</td>
                <td style="text-align: right;">$${Number(inv.total).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color: #16a34a; font-weight: 600;">Amount Paid:</td>
                <td style="text-align: right; color: #16a34a; font-weight: 700;">$${Number(inv.amountPaid || 0).toFixed(2)}</td>
              </tr>
              <tr style="border-top: 1px solid var(--border-medium);">
                <td style="font-weight: 700;">Amount Due:</td>
                <td style="text-align: right; font-weight: 800; color: ${balance > 0 ? '#dc2626' : '#16a34a'};">
                  $${balance.toFixed(2)}
                </td>
              </tr>
            </table>
          </div>

          <!-- Payment Transactions History -->
          <div style="margin-top: 36px; border-top: 1px solid var(--border-light); padding-top: 20px;">
            <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px;">
              Recorded Payment History (${(inv.payments || []).length})
            </h4>
            ${(!inv.payments || inv.payments.length === 0) ? `
              <div style="font-size: 0.8rem; color: var(--text-dim); font-style: italic;">
                No payments have been recorded against this invoice yet.
              </div>
            ` : `
              <div class="table-responsive">
                <table class="table" style="font-size: 0.8rem;">
                  <thead>
                    <tr>
                      <th>Payment Date</th>
                      <th>Method</th>
                      <th>Reference Note</th>
                      <th style="text-align: right;">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${inv.payments.map(p => `
                      <tr>
                        <td>${p.date}</td>
                        <td><span class="badge badge-active">${p.method}</span></td>
                        <td>${p.note || '-'}</td>
                        <td style="text-align: right; font-weight: 700; color: #16a34a;">
                          +$${Number(p.amount).toFixed(2)}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindInvoiceEvents(navigate) {
  // Filter tabs
  document.querySelectorAll('.filter-inv-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentInvoiceFilter = e.currentTarget.getAttribute('data-status');
      currentSelectedInvoiceId = null;
      navigate('invoices');
    });
  });

  // Table row click -> detail
  document.querySelectorAll('.inv-row, .btn-open-inv-detail').forEach(el => {
    el.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      currentSelectedInvoiceId = id;
      navigate('invoices', { invoiceId: id });
    });
  });

  // Back button
  const btnBack = document.getElementById('btn-back-to-invoices');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      currentSelectedInvoiceId = null;
      navigate('invoices');
    });
  }

  // Quick goto billing
  const btnGotoBilling = document.getElementById('btn-goto-billing');
  if (btnGotoBilling) {
    btnGotoBilling.addEventListener('click', () => navigate('billing'));
  }

  // Search
  const searchInput = document.getElementById('search-invoices');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#invoices-table tbody tr').forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  // Confirm Invoice
  const btnConfirm = document.getElementById('btn-inv-confirm');
  if (btnConfirm && currentSelectedInvoiceId) {
    btnConfirm.addEventListener('click', () => {
      const state = store.loadState();
      const inv = state.invoices.find(i => i.id === currentSelectedInvoiceId);
      if (inv) {
        inv.status = 'Confirmed';
        store.saveState();
        showToast(`Invoice ${inv.number} confirmed and ready for payment.`, 'success');
        navigate('invoices', { invoiceId: currentSelectedInvoiceId });
      }
    });
  }

  // Cancel Invoice
  const btnCancel = document.getElementById('btn-inv-cancel');
  if (btnCancel && currentSelectedInvoiceId) {
    btnCancel.addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel this invoice?')) {
        const state = store.loadState();
        const inv = state.invoices.find(i => i.id === currentSelectedInvoiceId);
        if (inv) {
          inv.status = 'Cancelled';
          store.saveState();
          showToast(`Invoice ${inv.number} cancelled.`, 'info');
          navigate('invoices', { invoiceId: currentSelectedInvoiceId });
        }
      }
    });
  }

  // Register Payment
  const btnPay = document.getElementById('btn-inv-pay');
  if (btnPay && currentSelectedInvoiceId) {
    btnPay.addEventListener('click', () => {
      openPaymentModal(currentSelectedInvoiceId, () => {
        navigate('invoices', { invoiceId: currentSelectedInvoiceId });
      });
    });
  }

  // Send by Email
  const btnSend = document.getElementById('btn-inv-send');
  if (btnSend && currentSelectedInvoiceId) {
    btnSend.addEventListener('click', () => {
      const state = store.loadState();
      const inv = state.invoices.find(i => i.id === currentSelectedInvoiceId);
      if (inv) {
        store.addNotification({
          type: 'invoice',
          recipient: inv.customerName,
          subject: `Invoice ${inv.number} from Brightloop Software`,
          body: `Dear ${inv.customerName}, please find your invoice ${inv.number} for $${inv.total.toFixed(2)} attached. Due date: ${inv.dueDate}. Thank you!`
        });
        showToast(`Invoice ${inv.number} sent to ${inv.customerName} (saved in communications inbox)!`, 'success');
      }
    });
  }

  // Print Invoice
  const btnPrint = document.getElementById('btn-inv-print');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }
}
