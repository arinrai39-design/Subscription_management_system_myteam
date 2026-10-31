import { store } from '../state/store.js';
import { icons } from '../utils/icons.js';
import { showToast } from '../utils/toast.js';

export function openPaymentModal(invoiceId, onPaymentComplete) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  const state = store.loadState();
  const invoice = state.invoices.find(i => i.id === invoiceId);
  if (!invoice) return;

  const total = Number(invoice.total);
  const paid = Number(invoice.amountPaid || 0);
  const balance = Math.max(0, total - paid);

  container.innerHTML = `
    <div class="modal-backdrop" id="payment-modal-backdrop">
      <div class="modal-content modal-content-sm">
        <div class="modal-header">
          <div class="modal-title">
            <span style="color: var(--teal);">${icons.payment}</span>
            Register Payment for ${invoice.number}
          </div>
          <button class="modal-close-btn" id="modal-close">&times;</button>
        </div>
        <form id="payment-form">
          <div class="modal-body">
            <div style="background: #f8fafc; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 12px 16px; margin-bottom: 16px;">
              <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
                <span style="font-size: 0.8rem; color: var(--text-muted);">Invoice Total:</span>
                <span style="font-weight: 600;">$${total.toFixed(2)}</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
                <span style="font-size: 0.8rem; color: var(--text-muted);">Already Paid:</span>
                <span style="font-weight: 600; color: #16a34a;">$${paid.toFixed(2)}</span>
              </div>
              <div style="display:flex; justify-content:space-between; border-top: 1px solid var(--border-medium); padding-top: 6px;">
                <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">Remaining Due:</span>
                <span style="font-size: 1.05rem; font-weight: 800; color: #dc2626;">$${balance.toFixed(2)}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Payment Method <span class="required">*</span></label>
              <select class="form-control form-select" id="pay-method" required>
                <option value="Credit Card">Credit Card (Stripe)</option>
                <option value="Bank Transfer">Bank Wire Transfer</option>
                <option value="PayPal">PayPal Business</option>
                <option value="Cheque">Corporate Check / Draft</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Amount Paid ($) <span class="required">*</span></label>
              <input type="number" step="0.01" class="form-control" id="pay-amount" value="${balance.toFixed(2)}" max="${balance.toFixed(2)}" min="0.01" required />
              <div style="font-size: 0.725rem; color: var(--text-muted); margin-top: 3px;">
                Supports full settlement or partial payments.
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Payment Date</label>
              <input type="date" class="form-control" id="pay-date" value="${new Date().toISOString().split('T')[0]}" />
            </div>

            <div class="form-group">
              <label class="form-label">Reference Note / Transaction Memo</label>
              <input type="text" class="form-control" id="pay-note" placeholder="e.g. Wire confirmation WT-98124 or Stripe Auth" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="modal-cancel">Cancel</button>
            <button type="submit" class="btn btn-teal">
              ${icons.check} Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const closeModal = () => { container.innerHTML = ''; };
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('payment-modal-backdrop').addEventListener('click', (e) => {
    if (e.target.id === 'payment-modal-backdrop') closeModal();
  });

  document.getElementById('payment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const method = document.getElementById('pay-method').value;
    const amount = Number(document.getElementById('pay-amount').value);
    const date = document.getElementById('pay-date').value;
    const note = document.getElementById('pay-note').value.trim();

    try {
      const updatedInv = store.recordPayment(invoiceId, { method, amount, date, note });
      showToast(`Payment of $${amount.toFixed(2)} recorded on ${invoice.number}!`, 'success');
      closeModal();
      if (onPaymentComplete) onPaymentComplete(updatedInv);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
