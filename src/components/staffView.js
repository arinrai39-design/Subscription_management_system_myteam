import { store } from '../state/store.js';
import { icons } from '../utils/icons.js';
import { showToast } from '../utils/toast.js';

export function renderStaff(navigate) {
  const state = store.loadState();
  const currentUser = state.currentUser;
  const isAdmin = currentUser.role === 'admin';
  const staffUsers = state.users.filter(u => u.role === 'admin' || u.role === 'staff');

  return `
    <div>
      <div class="sub-navbar">
        <div class="sub-navbar-left">
          <div class="page-title-group">
            <h1>${icons.staff} Internal Staff & Access Permissions</h1>
            <span class="page-subtitle">Manage internal operations team, day-to-day roles, and administrative privileges</span>
          </div>
        </div>
        <div class="sub-navbar-actions">
          ${isAdmin ? `
            <button class="btn btn-primary btn-sm" id="btn-add-staff">
              ${icons.plus} Add Staff Member
            </button>
          ` : `
            <span class="badge badge-closed">Admin Protected: Read Only</span>
          `}
        </div>
      </div>

      <div class="main-content">
        <!-- Explanatory Banner (Scene 1) -->
        <div style="background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: var(--radius-md); padding: 16px 20px; margin-bottom: 24px; display:flex; gap: 14px; align-items:center;">
          <div style="color: var(--primary);">${icons.staff}</div>
          <div style="font-size: 0.85rem; color: #831843;">
            <strong>RBAC Security Principle:</strong>
            Not everyone who logs in should see the same things. The <strong>Admin</strong> controls the whole system. Internal staff handle day-to-day customer operations with limited access, and only the admin can add a new member of staff.
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Active Internal Personnel (${staffUsers.length})</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Current Active Session: <strong>${currentUser.name} (${currentUser.role.toUpperCase()})</strong></span>
          </div>
          <div class="card-body" style="padding: 0;">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Name / Identity</th>
                    <th>Email Address</th>
                    <th>System Role</th>
                    <th>Department</th>
                    <th>Created Date</th>
                    <th style="text-align: right;">Access Permissions</th>
                  </tr>
                </thead>
                <tbody>
                  ${staffUsers.map(u => `
                    <tr>
                      <td>
                        <div style="font-weight: 700;">${u.name}</div>
                        <div style="font-size: 0.725rem; color: var(--text-dim);">ID: ${u.id}</div>
                      </td>
                      <td><code>${u.email}</code></td>
                      <td>
                        <span class="badge ${u.role === 'admin' ? 'badge-confirmed' : 'badge-active'}" style="text-transform:uppercase;">
                          ${u.role}
                        </span>
                      </td>
                      <td>${u.companyName || 'Brightloop HQ'}</td>
                      <td>${u.createdAt || '2026-01-01'}</td>
                      <td style="text-align: right;">
                        <span style="font-size: 0.775rem; color: var(--text-muted);">
                          ${u.role === 'admin' ? 'Full System Master Control' : 'Day-to-day Operations & Billing'}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindStaffEvents(navigate) {
  const btnAddStaff = document.getElementById('btn-add-staff');
  if (btnAddStaff) {
    btnAddStaff.addEventListener('click', () => openAddStaffModal(navigate));
  }
}

function openAddStaffModal(navigate) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  container.innerHTML = `
    <div class="modal-backdrop" id="add-staff-modal-backdrop">
      <div class="modal-content modal-content-sm">
        <div class="modal-header">
          <div class="modal-title">
            <span style="color: var(--primary);">${icons.staff}</span>
            Add Internal Staff Member
          </div>
          <button class="modal-close-btn" id="modal-close">&times;</button>
        </div>
        <form id="add-staff-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Full Name <span class="required">*</span></label>
              <input type="text" class="form-control" id="stf-name" placeholder="e.g. Jordan Lee" required />
            </div>

            <div class="form-group">
              <label class="form-label">Email Address <span class="required">*</span></label>
              <input type="email" class="form-control" id="stf-email" placeholder="jordan@brightloop.com" required />
            </div>

            <div class="form-group">
              <label class="form-label">Assigned Role <span class="required">*</span></label>
              <select class="form-control form-select" id="stf-role">
                <option value="staff">Internal Staff (Day-to-Day Operations)</option>
                <option value="admin">System Administrator (Full Privileges)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Department / Unit</label>
              <input type="text" class="form-control" id="stf-dept" value="Brightloop Customer Success" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="modal-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary">Enroll Staff Member</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const closeModal = () => { container.innerHTML = ''; };
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);

  document.getElementById('add-staff-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('stf-name').value.trim();
    const email = document.getElementById('stf-email').value.trim();
    const role = document.getElementById('stf-role').value;
    const dept = document.getElementById('stf-dept').value.trim();

    try {
      store.addStaffMember({ name, email, role, companyName: dept });
      showToast(`Staff member ${name} enrolled successfully!`, 'success');
      closeModal();
      navigate('staff');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
