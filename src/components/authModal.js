import { store } from '../state/store.js';
import { icons } from '../utils/icons.js';
import { showToast } from '../utils/toast.js';
import { toggleNotificationDrawer } from './notificationDrawer.js';

export function openSignUpModal() {
  const container = document.getElementById('modal-container');
  if (!container) return;

  container.innerHTML = `
    <div class="modal-backdrop" id="auth-modal-backdrop">
      <div class="modal-content modal-content-sm">
        <div class="modal-header">
          <div class="modal-title">
            <span style="color: var(--primary);">${icons.user}</span>
            Create Customer Account
          </div>
          <button class="modal-close-btn" id="modal-close">&times;</button>
        </div>
        <form id="signup-form">
          <div class="modal-body">
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">
              Sign up for the Brightloop self-service portal to view and manage your subscriptions and invoices.
            </p>
            <div class="form-group">
              <label class="form-label">Full Name <span class="required">*</span></label>
              <input type="text" class="form-control" id="su-name" placeholder="e.g. Alex Vance" required />
            </div>
            <div class="form-group">
              <label class="form-label">Company Name</label>
              <input type="text" class="form-control" id="su-company" placeholder="e.g. TechNova Labs" />
            </div>
            <div class="form-group">
              <label class="form-label">Email Address <span class="required">*</span></label>
              <input type="email" class="form-control" id="su-email" placeholder="you@company.com" required />
              <div id="email-feedback" style="font-size: 0.75rem; margin-top: 3px; display: none;"></div>
            </div>
            <div class="form-group">
              <label class="form-label">Password <span class="required">*</span></label>
              <input type="password" class="form-control" id="su-password" placeholder="Create strong password" required />
              
              <!-- Strict Password Criteria Checklist -->
              <div class="password-checklist" id="pw-checklist">
                <div class="checklist-item" id="chk-len">
                  <span class="chk-icon">&bull;</span> More than 8 characters in length
                </div>
                <div class="checklist-item" id="chk-upper">
                  <span class="chk-icon">&bull;</span> At least 1 uppercase letter (A-Z)
                </div>
                <div class="checklist-item" id="chk-lower">
                  <span class="chk-icon">&bull;</span> At least 1 lowercase letter (a-z)
                </div>
                <div class="checklist-item" id="chk-special">
                  <span class="chk-icon">&bull;</span> At least 1 special character (!@#$%^&* etc.)
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="modal-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary" id="btn-submit-signup">Create Account</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const pwInput = document.getElementById('su-password');
  const chkLen = document.getElementById('chk-len');
  const chkUpper = document.getElementById('chk-upper');
  const chkLower = document.getElementById('chk-lower');
  const chkSpecial = document.getElementById('chk-special');

  const updatePasswordChecks = (pw) => {
    const isLen = pw.length > 8;
    const isUpper = /[A-Z]/.test(pw);
    const isLower = /[a-z]/.test(pw);
    const isSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pw);

    chkLen.className = `checklist-item ${isLen ? 'valid' : 'invalid'}`;
    chkLen.querySelector('.chk-icon').innerHTML = isLen ? '&#10003;' : '&bull;';

    chkUpper.className = `checklist-item ${isUpper ? 'valid' : 'invalid'}`;
    chkUpper.querySelector('.chk-icon').innerHTML = isUpper ? '&#10003;' : '&bull;';

    chkLower.className = `checklist-item ${isLower ? 'valid' : 'invalid'}`;
    chkLower.querySelector('.chk-icon').innerHTML = isLower ? '&#10003;' : '&bull;';

    chkSpecial.className = `checklist-item ${isSpecial ? 'valid' : 'invalid'}`;
    chkSpecial.querySelector('.chk-icon').innerHTML = isSpecial ? '&#10003;' : '&bull;';

    return isLen && isUpper && isLower && isSpecial;
  };

  pwInput.addEventListener('input', (e) => updatePasswordChecks(e.target.value));

  const closeModal = () => { container.innerHTML = ''; };
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('auth-modal-backdrop').addEventListener('click', (e) => {
    if (e.target.id === 'auth-modal-backdrop') closeModal();
  });

  const form = document.getElementById('signup-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('su-name').value.trim();
    const company = document.getElementById('su-company').value.trim();
    const email = document.getElementById('su-email').value.trim();
    const password = document.getElementById('su-password').value;

    if (!updatePasswordChecks(password)) {
      showToast('Password does not satisfy all security criteria.', 'error');
      return;
    }

    try {
      const newUser = store.signupCustomer({
        name,
        companyName: company,
        email,
        password
      });
      showToast(`Account created for ${newUser.name}! Switched to Customer Portal.`, 'success');
      closeModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

export function openForgotPasswordModal() {
  const container = document.getElementById('modal-container');
  if (!container) return;

  container.innerHTML = `
    <div class="modal-backdrop" id="forgot-modal-backdrop">
      <div class="modal-content modal-content-sm">
        <div class="modal-header">
          <div class="modal-title">
            <span style="color: var(--primary);">${icons.mail}</span>
            Reset Your Password
          </div>
          <button class="modal-close-btn" id="modal-close">&times;</button>
        </div>
        <form id="forgot-form">
          <div class="modal-body">
            <p style="font-size: 0.825rem; color: var(--text-muted); margin-bottom: 16px;">
              Enter your registered email address. A password reset link with a secure verification token will arrive in your communications inbox.
            </p>
            <div class="form-group">
              <label class="form-label">Registered Email <span class="required">*</span></label>
              <input type="email" class="form-control" id="forgot-email" placeholder="e.g. dave@smallshop.com" required />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="modal-cancel">Cancel</button>
            <button type="submit" class="btn btn-teal">Send Reset Link</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const closeModal = () => { container.innerHTML = ''; };
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('forgot-modal-backdrop').addEventListener('click', (e) => {
    if (e.target.id === 'forgot-modal-backdrop') closeModal();
  });

  const form = document.getElementById('forgot-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value.trim();
    try {
      const token = store.requestPasswordReset(email);
      showToast(`Password reset link dispatched to ${email}! Check communications inbox.`, 'success');
      closeModal();
      toggleNotificationDrawer(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

export function openResetPasswordModal(prefillToken = '') {
  const container = document.getElementById('modal-container');
  if (!container) return;

  container.innerHTML = `
    <div class="modal-backdrop" id="reset-modal-backdrop">
      <div class="modal-content modal-content-sm">
        <div class="modal-header">
          <div class="modal-title">
            <span style="color: var(--teal);">${icons.zap}</span>
            Set New Password
          </div>
          <button class="modal-close-btn" id="modal-close">&times;</button>
        </div>
        <form id="reset-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Security Reset Token <span class="required">*</span></label>
              <input type="text" class="form-control" id="reset-token" value="${prefillToken}" placeholder="e.g. rst-xyz123" required />
            </div>
            <div class="form-group">
              <label class="form-label">New Password <span class="required">*</span></label>
              <input type="password" class="form-control" id="reset-password" placeholder="Enter new strong password" required />
              
              <div class="password-checklist" id="reset-pw-checklist">
                <div class="checklist-item" id="r-chk-len">
                  <span class="chk-icon">&bull;</span> More than 8 characters in length
                </div>
                <div class="checklist-item" id="r-chk-upper">
                  <span class="chk-icon">&bull;</span> At least 1 uppercase letter (A-Z)
                </div>
                <div class="checklist-item" id="r-chk-lower">
                  <span class="chk-icon">&bull;</span> At least 1 lowercase letter (a-z)
                </div>
                <div class="checklist-item" id="r-chk-special">
                  <span class="chk-icon">&bull;</span> At least 1 special character (!@#$%^&*)
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="modal-cancel">Cancel</button>
            <button type="submit" class="btn btn-teal">Update Password</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const pwInput = document.getElementById('reset-password');
  const chkLen = document.getElementById('r-chk-len');
  const chkUpper = document.getElementById('r-chk-upper');
  const chkLower = document.getElementById('r-chk-lower');
  const chkSpecial = document.getElementById('r-chk-special');

  const updateChecks = (pw) => {
    const isLen = pw.length > 8;
    const isUpper = /[A-Z]/.test(pw);
    const isLower = /[a-z]/.test(pw);
    const isSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pw);

    chkLen.className = `checklist-item ${isLen ? 'valid' : 'invalid'}`;
    chkLen.querySelector('.chk-icon').innerHTML = isLen ? '&#10003;' : '&bull;';

    chkUpper.className = `checklist-item ${isUpper ? 'valid' : 'invalid'}`;
    chkUpper.querySelector('.chk-icon').innerHTML = isUpper ? '&#10003;' : '&bull;';

    chkLower.className = `checklist-item ${isLower ? 'valid' : 'invalid'}`;
    chkLower.querySelector('.chk-icon').innerHTML = isLower ? '&#10003;' : '&bull;';

    chkSpecial.className = `checklist-item ${isSpecial ? 'valid' : 'invalid'}`;
    chkSpecial.querySelector('.chk-icon').innerHTML = isSpecial ? '&#10003;' : '&bull;';

    return isLen && isUpper && isLower && isSpecial;
  };

  pwInput.addEventListener('input', (e) => updateChecks(e.target.value));

  const closeModal = () => { container.innerHTML = ''; };
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);

  const form = document.getElementById('reset-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const token = document.getElementById('reset-token').value.trim();
    const newPw = document.getElementById('reset-password').value;

    if (!updateChecks(newPw)) {
      showToast('Password does not fulfill the required security criteria.', 'error');
      return;
    }

    try {
      store.resetPasswordWithToken(token, newPw);
      showToast('Your password was successfully updated!', 'success');
      closeModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
