import './style.css';
import { store } from './state/store.js';
import { renderNavbar, bindNavbarEvents } from './components/navbar.js';
import { renderDashboard, initDashboardCharts, bindDashboardEvents } from './components/dashboard.js';
import { renderSubscriptions, bindSubscriptionEvents } from './components/subscriptionsView.js';
import { renderTemplates, bindTemplateEvents } from './components/templatesView.js';
import { renderBilling, bindBillingEvents } from './components/billingView.js';
import { renderInvoices, bindInvoiceEvents } from './components/invoicesView.js';
import { renderDiscounts, bindDiscountEvents } from './components/discountsView.js';
import { renderProductsAndPlans, bindProductAndPlanEvents } from './components/productsView.js';
import { renderStaff, bindStaffEvents } from './components/staffView.js';
import { renderCustomerPortal, bindCustomerPortalEvents } from './components/customerPortalView.js';
import { openResetPasswordModal } from './components/authModal.js';
import { renderNotificationDrawer } from './components/notificationDrawer.js';

let currentTab = 'dashboard';
let currentParams = {};

function getInitialTab() {
  const hash = window.location.hash.replace('#', '');
  const state = store.loadState();
  if (state.currentUser && state.currentUser.role === 'customer') {
    return 'customer-portal';
  }
  return hash || 'dashboard';
}

function navigate(tab, params = {}) {
  currentTab = tab;
  currentParams = params;
  window.location.hash = tab;
  renderApp();
}

function renderApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  const state = store.loadState();
  const currentUser = state.currentUser;

  // Role routing enforcement
  if (currentUser.role === 'customer' && currentTab !== 'customer-portal' && currentTab !== 'invoices') {
    currentTab = 'customer-portal';
  }

  // Render Navbar
  const navbarHtml = renderNavbar(currentTab, navigate);

  // Render View Body
  let bodyHtml = '';
  switch (currentTab) {
    case 'dashboard':
      bodyHtml = renderDashboard(navigate);
      break;
    case 'subscriptions':
      bodyHtml = renderSubscriptions(navigate, currentParams.subId);
      break;
    case 'templates':
      bodyHtml = renderTemplates(navigate);
      break;
    case 'billing':
      bodyHtml = renderBilling(navigate);
      break;
    case 'invoices':
      bodyHtml = renderInvoices(navigate, currentParams.invoiceId);
      break;
    case 'products':
      bodyHtml = renderProductsAndPlans(navigate);
      break;
    case 'discounts':
      bodyHtml = renderDiscounts(navigate);
      break;
    case 'staff':
      bodyHtml = renderStaff(navigate);
      break;
    case 'customer-portal':
      bodyHtml = renderCustomerPortal(navigate);
      break;
    default:
      bodyHtml = renderDashboard(navigate);
  }

  appContainer.innerHTML = `
    ${navbarHtml}
    <main style="flex:1;">
      ${bodyHtml}
    </main>
    <footer style="background: #fff; border-top: 1px solid var(--border-light); padding: 14px 24px; font-size: 0.775rem; color: var(--text-muted); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: 8px;">
      <div>
        <strong>Brightloop Software Inc.</strong> &bull; Odoo 17/18 Unified Recurring Billing Architecture &bull; All Systems Operational
      </div>
      <div>
        Active Session: <strong>${currentUser.name}</strong> (${currentUser.email} &bull; <span style="text-transform:uppercase; color:var(--primary); font-weight:700;">${currentUser.role}</span>)
      </div>
    </footer>
  `;

  // Bind Navbar Events
  bindNavbarEvents(navigate);

  // Bind Active View Events
  switch (currentTab) {
    case 'dashboard':
      bindDashboardEvents(navigate);
      initDashboardCharts();
      break;
    case 'subscriptions':
      bindSubscriptionEvents(navigate);
      break;
    case 'templates':
      bindTemplateEvents(navigate);
      break;
    case 'billing':
      bindBillingEvents(navigate);
      break;
    case 'invoices':
      bindInvoiceEvents(navigate);
      break;
    case 'products':
      bindProductAndPlanEvents(navigate);
      break;
    case 'discounts':
      bindDiscountEvents(navigate);
      break;
    case 'staff':
      bindStaffEvents(navigate);
      break;
    case 'customer-portal':
      bindCustomerPortalEvents(navigate);
      break;
  }

  // Ensure notification drawer updates if open
  renderNotificationDrawer();
}

// Global Event Listeners
window.addEventListener('open-reset-modal', (e) => {
  openResetPasswordModal(e.detail?.token || '');
});

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash && hash !== currentTab) {
    navigate(hash);
  }
});

// Subscribe store updates
store.subscribe(() => {
  renderApp();
});

// App Launch
currentTab = getInitialTab();
renderApp();
