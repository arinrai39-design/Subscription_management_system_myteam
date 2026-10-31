import { store } from '../state/store.js';
import { icons } from '../utils/icons.js';
import { showToast } from '../utils/toast.js';
import { toggleNotificationDrawer } from './notificationDrawer.js';
import { openSignUpModal, openForgotPasswordModal } from './authModal.js';

export function renderNavbar(activeTab, onTabChange) {
  const state = store.loadState();
  const currentUser = state.currentUser;
  const notifs = state.notifications || [];
  const unreadCount = notifs.filter(n => !n.read).length;

  const isAdmin = currentUser.role === 'admin';
  const isStaff = currentUser.role === 'staff';
  const isCustomer = currentUser.role === 'customer';

  return `
    <header class="top-navbar">
      <div class="navbar-left">
        <div class="brand-wrapper" id="brand-home">
          <div style="background: rgba(255,255,255,0.2); width: 34px; height: 34px; border-radius: var(--radius-sm); display:flex; align-items:center; justify-content:center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
              <path d="M2 12h20"/>
            </svg>
          </div>
          <div>
            <span style="font-weight: 800; letter-spacing: -0.03em;">odoo</span>
            <span style="font-weight: 500; opacity: 0.9; font-size: 0.95rem; margin-left: 4px;">Brightloop</span>
          </div>
          <span class="brand-badge">Subscriptions</span>
        </div>

        <nav class="app-nav-links">
          ${isCustomer ? `
            <a href="#customer-portal" class="nav-item ${activeTab === 'customer-portal' ? 'active' : ''}" data-tab="customer-portal">
              ${icons.portal} Customer Portal
            </a>
          ` : `
            <a href="#dashboard" class="nav-item ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
              ${icons.dashboard} Dashboard
            </a>
            <a href="#subscriptions" class="nav-item ${activeTab === 'subscriptions' ? 'active' : ''}" data-tab="subscriptions">
              ${icons.subscription} Subscriptions
            </a>
            <a href="#templates" class="nav-item ${activeTab === 'templates' ? 'active' : ''}" data-tab="templates">
              ${icons.template} Quotation Templates
            </a>
            <a href="#billing" class="nav-item ${activeTab === 'billing' ? 'active' : ''}" data-tab="billing">
              ${icons.billing} Billing Day
            </a>
            <a href="#invoices" class="nav-item ${activeTab === 'invoices' ? 'active' : ''}" data-tab="invoices">
              ${icons.invoice} Invoices
            </a>
            <a href="#products" class="nav-item ${activeTab === 'products' ? 'active' : ''}" data-tab="products">
              ${icons.products} Products & Plans
            </a>
            ${isAdmin ? `
              <a href="#discounts" class="nav-item ${activeTab === 'discounts' ? 'active' : ''}" data-tab="discounts">
                ${icons.discount} Discount Rules
              </a>
              <a href="#staff" class="nav-item ${activeTab === 'staff' ? 'active' : ''}" data-tab="staff">
                ${icons.staff} Staff Team
              </a>
            ` : ''}
          `}
        </nav>
      </div>

      <div class="navbar-right">
        <!-- Quick Billing Run Shortcut -->
        ${!isCustomer ? `
          <button class="billing-day-btn" id="btn-quick-billing-day" title="Execute automated recurring billing for subscriptions">
            ${icons.billing} Billing Day Run
          </button>
        ` : ''}

        <!-- Persona / Role Quick Switcher -->
        <div class="role-pill-badge" title="Instantly test Admin, Staff, or Customer perspectives">
          <span style="opacity: 0.8; font-size: 0.75rem;">Viewing As:</span>
          <select class="role-switcher-select" id="role-switcher">
            ${state.users.map(u => `
              <option value="${u.id}" ${u.id === currentUser.id ? 'selected' : ''}>
                ${u.name} (${u.role.toUpperCase()})
              </option>
            `).join('')}
          </select>
        </div>

        <!-- Communications / Reset Drawer Icon -->
        <button class="nav-icon-btn" id="btn-toggle-notifs" title="Communications Inbox & Password Reset Simulator">
          ${icons.bell}
          ${unreadCount > 0 ? `<span class="notification-count">${unreadCount}</span>` : ''}
        </button>

        <!-- Account / Sign Up Actions -->
        <button class="btn btn-secondary btn-sm" id="btn-customer-signup" style="background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.3); color: #fff;">
          ${icons.plus} New Customer Sign Up
        </button>

        <button class="btn btn-secondary btn-sm" id="btn-forgot-pw" style="background: transparent; border-color: rgba(255,255,255,0.25); color: rgba(255,255,255,0.9);" title="Test password reset email flow">
          Forgot Password?
        </button>

        <button class="nav-icon-btn" id="btn-reset-demo" title="Reset all demo data to initial pristine state" style="font-size: 0.75rem;">
          ${icons.rotate}
        </button>
      </div>
    </header>
  `;
}

export function bindNavbarEvents(onTabChange) {
  // Navigation tabs
  document.querySelectorAll('.app-nav-links .nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = e.currentTarget.getAttribute('data-tab');
      onTabChange(tab);
    });
  });

  const brandHome = document.getElementById('brand-home');
  if (brandHome) {
    brandHome.addEventListener('click', () => {
      const state = store.loadState();
      onTabChange(state.currentUser.role === 'customer' ? 'customer-portal' : 'dashboard');
    });
  }

  // Persona Switcher
  const switcher = document.getElementById('role-switcher');
  if (switcher) {
    switcher.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      store.switchUser(selectedId);
      const state = store.loadState();
      showToast(`Switched persona to ${state.currentUser.name} (${state.currentUser.role.toUpperCase()})`, 'info');
      onTabChange(state.currentUser.role === 'customer' ? 'customer-portal' : 'dashboard');
    });
  }

  // Notifications Drawer
  const btnNotifs = document.getElementById('btn-toggle-notifs');
  if (btnNotifs) {
    btnNotifs.addEventListener('click', () => toggleNotificationDrawer());
  }

  // Customer Sign Up
  const btnSignUp = document.getElementById('btn-customer-signup');
  if (btnSignUp) {
    btnSignUp.addEventListener('click', () => openSignUpModal());
  }

  // Forgot Password
  const btnForgot = document.getElementById('btn-forgot-pw');
  if (btnForgot) {
    btnForgot.addEventListener('click', () => openForgotPasswordModal());
  }

  // Quick Billing Day
  const btnQuickBilling = document.getElementById('btn-quick-billing-day');
  if (btnQuickBilling) {
    btnQuickBilling.addEventListener('click', () => onTabChange('billing'));
  }

  // Reset Demo
  const btnReset = document.getElementById('btn-reset-demo');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Reset all Brightloop subscriptions, invoices, and data back to pristine demo state?')) {
        store.resetToDefaults();
        showToast('All system records reset to demo defaults', 'success');
        onTabChange('dashboard');
      }
    });
  }
}
