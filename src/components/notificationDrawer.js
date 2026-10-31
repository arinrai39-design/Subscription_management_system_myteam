import { store } from '../state/store.js';
import { icons } from '../utils/icons.js';
import { showToast } from '../utils/toast.js';

let isDrawerOpen = false;

export function toggleNotificationDrawer(open) {
  isDrawerOpen = typeof open === 'boolean' ? open : !isDrawerOpen;
  renderNotificationDrawer();
}

export function renderNotificationDrawer() {
  let drawerContainer = document.getElementById('notification-drawer-root');
  if (!drawerContainer) {
    drawerContainer = document.createElement('div');
    drawerContainer.id = 'notification-drawer-root';
    document.body.appendChild(drawerContainer);
  }

  if (!isDrawerOpen) {
    drawerContainer.innerHTML = '';
    return;
  }

  const state = store.loadState();
  const notifs = state.notifications || [];

  drawerContainer.innerHTML = `
    <div class="drawer-backdrop" id="drawer-backdrop"></div>
    <div class="drawer-panel">
      <div class="drawer-header">
        <div class="drawer-title">
          <span style="color: var(--primary);">${icons.bell}</span>
          System Communications & Email Simulator
        </div>
        <button class="modal-close-btn" id="drawer-close">&times;</button>
      </div>
      <div style="padding: 10px 16px; background: #fff; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.775rem; color: var(--text-muted);">${notifs.length} system messages logged</span>
        <button class="btn btn-secondary btn-sm" id="btn-mark-all-read">Mark all as read</button>
      </div>
      <div class="drawer-body">
        ${notifs.length === 0 ? `
          <div style="text-align: center; padding: 40px 20px; color: var(--text-dim);">
            ${icons.mail}
            <p style="margin-top: 8px; font-size: 0.85rem;">No notifications or emails dispatched yet.</p>
          </div>
        ` : notifs.map(n => `
          <div class="email-card ${n.read ? '' : 'unread'}">
            <div class="email-meta">
              <span>To: <strong>${escapeHtml(n.recipient)}</strong></span>
              <span>${n.date}</span>
            </div>
            <div class="email-subject">${escapeHtml(n.subject)}</div>
            <div class="email-preview">${n.body}</div>
            ${n.token ? `
              <div style="margin-top: 4px;">
                <button class="btn btn-teal btn-sm btn-test-token" data-token="${n.token}">
                  ${icons.zap} Open Password Reset Form with this Token
                </button>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('drawer-backdrop').addEventListener('click', () => toggleNotificationDrawer(false));
  document.getElementById('drawer-close').addEventListener('click', () => toggleNotificationDrawer(false));
  document.getElementById('btn-mark-all-read').addEventListener('click', () => {
    store.markAllNotificationsRead();
    showToast('All notifications marked as read', 'info');
    renderNotificationDrawer();
  });

  drawerContainer.querySelectorAll('.btn-test-token').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const token = e.currentTarget.getAttribute('data-token');
      toggleNotificationDrawer(false);
      window.dispatchEvent(new CustomEvent('open-reset-modal', { detail: { token } }));
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
