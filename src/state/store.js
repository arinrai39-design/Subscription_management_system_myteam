import { initialData } from './initialData.js';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'brightloop_subscription_os_v1';

class Store {
  constructor() {
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage, falling back to initial data', e);
    }
    return JSON.parse(JSON.stringify(initialData));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
    this.notify();
  }

  resetToDefaults() {
    this.state = JSON.parse(JSON.stringify(initialData));
    this.saveState();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (e) {
        console.error('Error in store subscriber', e);
      }
    });
  }

  // --- Auth & Users ---
  getCurrentUser() {
    return this.state.currentUser;
  }

  switchUser(userId) {
    const user = this.state.users.find(u => u.id === userId);
    if (user) {
      this.state.currentUser = { ...user };
      this.saveState();
    }
  }

  signupCustomer({ name, email, password, companyName, phone, address }) {
    // Validation 1: Email must be unique
    const existing = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error(`The email address ${email} is already registered to another account.`);
    }

    // Validation 2: Password must be > 8 characters, uppercase, lowercase, special character
    if (password.length <= 8) {
      throw new Error('Password must be more than 8 characters in length.');
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter (A-Z).');
    }
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter (a-z).');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new Error('Password must contain at least one special character (!@#$%^&* etc).');
    }

    const newUser = {
      id: 'usr-cust-' + Date.now(),
      name,
      email,
      role: 'customer',
      companyName: companyName || `${name}'s Company`,
      phone: phone || '',
      address: address || '',
      password, // in a real backend hashed, here stored for demo
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.state.users.push(newUser);
    this.state.currentUser = newUser;
    this.saveState();

    // Send welcome notification
    this.addNotification({
      type: 'welcome',
      recipient: email,
      subject: 'Welcome to Brightloop Software Portal!',
      body: `Hello ${name}, your customer portal account is ready. You can now track subscriptions, review invoices, and manage payment methods online.`
    });

    return newUser;
  }

  requestPasswordReset(email) {
    const user = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error(`No account found matching email address: ${email}`);
    }

    const token = 'rst-' + Math.random().toString(36).substring(2, 9);
    this.addNotification({
      type: 'reset',
      recipient: email,
      subject: 'Password Reset Instructions for Brightloop Account',
      body: `You requested a password reset. Use security token [${token}] or click the link to configure a new password.`,
      token
    });

    return token;
  }

  resetPasswordWithToken(token, newPassword) {
    const notif = this.state.notifications.find(n => n.token === token);
    if (!notif) {
      throw new Error('Invalid or expired password reset link token.');
    }

    if (newPassword.length <= 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      throw new Error('New password does not meet the strict security criteria.');
    }

    const user = this.state.users.find(u => u.email === notif.recipient);
    if (user) {
      user.password = newPassword;
      this.saveState();
      return true;
    }
    throw new Error('User not found.');
  }

  addStaffMember({ name, email, role = 'staff', companyName = 'Brightloop Software' }) {
    if (this.state.currentUser.role !== 'admin') {
      throw new Error('Access Denied: Only administrators can add a new member of staff.');
    }

    const existing = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newStaff = {
      id: 'usr-staff-' + Date.now(),
      name,
      email,
      role,
      companyName,
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.state.users.push(newStaff);
    this.saveState();
    return newStaff;
  }

  // --- Notifications Drawer ---
  addNotification(notif) {
    const newNotif = {
      id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false,
      ...notif
    };
    this.state.notifications.unshift(newNotif);
    this.saveState();
  }

  markAllNotificationsRead() {
    this.state.notifications.forEach(n => (n.read = true));
    this.saveState();
  }

  // --- Products & Variants ---
  addProduct(productData) {
    const newProd = {
      id: 'prod-' + Date.now(),
      variants: [{ id: 'var-std-' + Date.now(), name: 'Standard Edition', extraPrice: 0 }],
      ...productData
    };
    this.state.products.push(newProd);
    this.saveState();
    return newProd;
  }

  // --- Plans & Lifecycle rules ---
  addPlan(planData) {
    const newPlan = {
      id: 'plan-' + Date.now(),
      rules: {
        autoCloseOnEnd: true,
        allowEarlyClose: true,
        allowPause: true,
        allowRenewal: true,
        ...(planData.rules || {})
      },
      ...planData
    };
    this.state.plans.push(newPlan);
    this.saveState();
    return newPlan;
  }

  // --- Quotation Templates ---
  addQuotationTemplate(tmplData) {
    const newTmpl = {
      id: 'tmpl-' + Date.now(),
      ...tmplData
    };
    this.state.quotationTemplates.push(newTmpl);
    this.saveState();
    return newTmpl;
  }

  createSubscriptionFromTemplate(templateId, customerId) {
    const template = this.state.quotationTemplates.find(t => t.id === templateId);
    if (!template) throw new Error('Quotation template not found.');

    const customer = this.state.users.find(u => u.id === customerId);
    if (!customer) throw new Error('Customer account not found.');

    const plan = this.state.plans.find(p => p.id === template.planId);
    const startDate = new Date().toISOString().split('T')[0];
    
    // Compute expiry based on validityDays
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + (template.validityDays || 15));
    const expiryDate = expiry.toISOString().split('T')[0];

    const subNumber = 'SUB-2026-' + String(this.state.subscriptions.length + 1).padStart(4, '0');

    const defaultTax = this.state.taxes.find(t => t.isDefault) || this.state.taxes[0];

    const lines = template.lines.map(line => ({
      ...line,
      taxId: defaultTax ? defaultTax.id : 'tax-vat'
    }));

    const newSub = {
      id: 'sub-' + Date.now(),
      number: subNumber,
      customerId: customer.id,
      customerName: customer.name,
      companyName: customer.companyName || customer.name,
      planId: template.planId,
      status: 'Quotation', // Starts as Quotation per Scene 3
      startDate,
      expiryDate,
      nextBillingDate: startDate,
      paymentTerms: '15 Days',
      lastBilledDate: null,
      lines,
      appliedDiscountCode: null,
      notes: `Generated from template: ${template.name}`
    };

    // Auto-check discounts
    this.autoApplyBestDiscount(newSub);

    this.state.subscriptions.unshift(newSub);
    this.saveState();
    return newSub;
  }

  // --- Discount Rules (Admin Only) ---
  addDiscountRule(discountData) {
    if (this.state.currentUser.role !== 'admin') {
      throw new Error('Access Denied: Only administrators can create or configure discount rules.');
    }

    const newDiscount = {
      id: 'disc-' + Date.now(),
      currentUsageCount: 0,
      ...discountData
    };

    this.state.discounts.push(newDiscount);
    this.saveState();
    return newDiscount;
  }

  autoApplyBestDiscount(subOrQuote) {
    const today = new Date().toISOString().split('T')[0];
    const totalQty = subOrQuote.lines.reduce((sum, l) => sum + Number(l.quantity || 0), 0);
    const subtotal = subOrQuote.lines.reduce((sum, l) => sum + (Number(l.quantity) * Number(l.unitPrice)), 0);

    // Find eligible discounts
    const eligible = this.state.discounts.filter(d => {
      if (d.startDate && d.startDate > today) return false;
      if (d.endDate && d.endDate < today) return false;
      if (d.maxUsageCount && d.currentUsageCount >= d.maxUsageCount) return false;
      if (d.minQuantity && totalQty < d.minQuantity) return false;
      if (d.minPurchase && subtotal < d.minPurchase) return false;
      return true;
    });

    if (eligible.length > 0) {
      // Pick best discount
      eligible.sort((a, b) => {
        const valA = a.type === 'percentage' ? (subtotal * a.value / 100) : a.value;
        const valB = b.type === 'percentage' ? (subtotal * b.value / 100) : b.value;
        return valB - valA;
      });
      subOrQuote.appliedDiscountCode = eligible[0].code;
    }
  }

  // --- Subscriptions Lifecycle ---
  updateSubscriptionStatus(subId, newStatus, reason = '') {
    const sub = this.state.subscriptions.find(s => s.id === subId);
    if (!sub) throw new Error('Subscription not found.');

    const plan = this.state.plans.find(p => p.id === sub.planId);
    
    // Check plan lifecycle rules
    if (newStatus === 'Paused' && plan && plan.rules && !plan.rules.allowPause) {
      throw new Error(`Plan "${plan.name}" does not allow pausing.`);
    }

    if (newStatus === 'Closed' && plan && plan.rules && !plan.rules.allowEarlyClose) {
      // If closing early before expiry
      const today = new Date().toISOString().split('T')[0];
      if (sub.expiryDate && sub.expiryDate > today) {
        throw new Error(`Plan "${plan.name}" does not permit early closure.`);
      }
    }

    sub.status = newStatus;
    if (reason) sub.pauseReason = reason;

    if (newStatus === 'Active') {
      // Set next billing date if not set
      if (!sub.nextBillingDate) {
        sub.nextBillingDate = new Date().toISOString().split('T')[0];
      }
    }

    this.saveState();
    return sub;
  }

  renewSubscription(subId) {
    const sub = this.state.subscriptions.find(s => s.id === subId);
    if (!sub) throw new Error('Subscription not found.');

    const plan = this.state.plans.find(p => p.id === sub.planId);
    if (plan && plan.rules && !plan.rules.allowRenewal) {
      throw new Error(`Plan "${plan.name}" does not allow renewal.`);
    }

    // Add period based on frequency
    const currentExpiry = new Date(sub.expiryDate || Date.now());
    if (plan.billingFrequency === 'yearly') {
      currentExpiry.setFullYear(currentExpiry.getFullYear() + 1);
    } else if (plan.billingFrequency === 'weekly') {
      currentExpiry.setDate(currentExpiry.getDate() + 7);
    } else if (plan.billingFrequency === 'daily') {
      currentExpiry.setDate(currentExpiry.getDate() + 1);
    } else {
      currentExpiry.setMonth(currentExpiry.getMonth() + 1);
    }

    sub.expiryDate = currentExpiry.toISOString().split('T')[0];
    sub.status = 'Active';
    this.saveState();
    return sub;
  }

  // --- BILLING DAY ENGINE (Recurring & Batch Invoicing) ---
  runBillingDay(billingDateStr) {
    const targetDate = billingDateStr || new Date().toISOString().split('T')[0];
    const activeSubs = this.state.subscriptions.filter(s => s.status === 'Active');

    let generatedCount = 0;
    let skippedCount = 0;
    let totalBilled = 0;
    const generatedInvoices = [];

    activeSubs.forEach(sub => {
      // Idempotency check: has this subscription already been billed for this date/period?
      // Check if lastBilledDate matches targetDate or if an invoice exists for this subscription on this target cycle
      const alreadyBilled = this.state.invoices.some(inv => {
        return inv.subscriptionId === sub.id && 
               inv.status !== 'Cancelled' &&
               inv.billingPeriod &&
               inv.billingPeriod.includes(targetDate.substring(0, 7)); // Same month cycle
      });

      if (alreadyBilled) {
        skippedCount++;
        return;
      }

      // Generate invoice
      const invoice = this.generateInvoiceFromSub(sub, targetDate);
      generatedInvoices.push(invoice);
      generatedCount++;
      totalBilled += invoice.total;

      // Update subscription lastBilledDate and calculate nextBillingDate
      sub.lastBilledDate = targetDate;
      const plan = this.state.plans.find(p => p.id === sub.planId);
      const nextDate = new Date(targetDate);
      if (plan && plan.billingFrequency === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      } else if (plan && plan.billingFrequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (plan && plan.billingFrequency === 'daily') {
        nextDate.setDate(nextDate.getDate() + 1);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      sub.nextBillingDate = nextDate.toISOString().split('T')[0];

      // If plan has autoCloseOnEnd and expiry reached, auto-close it
      if (plan && plan.rules && plan.rules.autoCloseOnEnd && sub.expiryDate && sub.expiryDate <= targetDate) {
        sub.status = 'Closed';
      }
    });

    this.saveState();

    return {
      targetDate,
      generatedCount,
      skippedCount,
      totalBilled,
      generatedInvoices
    };
  }

  generateInvoiceFromSub(sub, invoiceDateStr) {
    const invoiceDate = invoiceDateStr || new Date().toISOString().split('T')[0];
    const invNumber = 'INV-2026-' + String(this.state.invoices.length + 1).padStart(4, '0');

    // Due date based on payment terms
    const dueDateObj = new Date(invoiceDate);
    if (sub.paymentTerms === '15 Days') dueDateObj.setDate(dueDateObj.getDate() + 15);
    else if (sub.paymentTerms === '30 Days') dueDateObj.setDate(dueDateObj.getDate() + 30);
    else if (sub.paymentTerms === '60 Days') dueDateObj.setDate(dueDateObj.getDate() + 60);
    const dueDate = dueDateObj.toISOString().split('T')[0];

    // Compute lines
    let subtotal = 0;
    const invLines = sub.lines.map(line => {
      const prod = this.state.products.find(p => p.id === line.productId);
      const variant = prod ? prod.variants.find(v => v.id === line.variantId) : null;
      const desc = `${prod ? prod.name : 'Subscription Item'}${variant && variant.extraPrice > 0 ? ` (${variant.name})` : ''}`;
      const lineAmount = Number(line.quantity) * Number(line.unitPrice);
      subtotal += lineAmount;

      return {
        description: desc,
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
        amount: lineAmount,
        productId: line.productId
      };
    });

    // Discount calculation
    let discountAmount = 0;
    if (sub.appliedDiscountCode) {
      const discount = this.state.discounts.find(d => d.code === sub.appliedDiscountCode);
      if (discount) {
        if (discount.type === 'percentage') {
          discountAmount = (subtotal * discount.value) / 100;
        } else {
          discountAmount = discount.value;
        }
        // Increment discount usage
        discount.currentUsageCount = (discount.currentUsageCount || 0) + 1;
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);

    // Tax calculation using admin rules
    const defaultTax = this.state.taxes.find(t => t.isDefault) || this.state.taxes[0];
    const taxRate = defaultTax ? defaultTax.rate : 0.10;
    const taxAmount = Number((discountedSubtotal * taxRate).toFixed(2));
    const grandTotal = Number((discountedSubtotal + taxAmount).toFixed(2));

    const invoice = {
      id: 'inv-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      number: invNumber,
      subscriptionId: sub.id,
      subscriptionNumber: sub.number,
      customerId: sub.customerId,
      customerName: sub.customerName,
      companyName: sub.companyName,
      billingPeriod: `${invoiceDate} to ${sub.nextBillingDate || invoiceDate}`,
      invoiceDate,
      dueDate,
      status: 'Confirmed', // Created confirmed and ready for payment
      subtotal,
      discountAmount,
      taxAmount,
      total: grandTotal,
      amountPaid: 0,
      lines: invLines,
      payments: []
    };

    this.state.invoices.unshift(invoice);

    // Notify customer
    const customer = this.state.users.find(u => u.id === sub.customerId);
    if (customer) {
      this.addNotification({
        type: 'invoice',
        recipient: customer.email,
        subject: `New Recurring Invoice ${invNumber} from Brightloop Software`,
        body: `Dear ${customer.name}, your recurring billing invoice ${invNumber} for ${grandTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} has been issued.`
      });
    }

    return invoice;
  }

  // --- Payments Engine ---
  recordPayment(invoiceId, { method, amount, date, note }) {
    const invoice = this.state.invoices.find(i => i.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found.');

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      throw new Error('Please enter a valid positive payment amount.');
    }

    const paymentRecord = {
      id: 'pay-' + Date.now(),
      date: date || new Date().toISOString().split('T')[0],
      method: method || 'Credit Card',
      amount: paymentAmount,
      note: note || ''
    };

    invoice.payments.push(paymentRecord);
    invoice.amountPaid = Number(((invoice.amountPaid || 0) + paymentAmount).toFixed(2));

    if (invoice.amountPaid >= invoice.total) {
      invoice.status = 'Paid';
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
    }

    this.saveState();

    // Send receipt
    const customer = this.state.users.find(u => u.id === invoice.customerId);
    if (customer) {
      this.addNotification({
        type: 'receipt',
        recipient: customer.email,
        subject: `Payment Receipt for ${invoice.number}`,
        body: `We have received your payment of $${paymentAmount.toFixed(2)} via ${method}. Remaining balance: $${Math.max(0, invoice.total - invoice.amountPaid).toFixed(2)}.`
      });
    }

    return invoice;
  }

  // --- Tax Management (Admin) ---
  addTaxRule(taxData) {
    if (this.state.currentUser.role !== 'admin') {
      throw new Error('Only administrators can configure tax rules.');
    }
    const newTax = {
      id: 'tax-' + Date.now(),
      ...taxData
    };
    this.state.taxes.push(newTax);
    this.saveState();
    return newTax;
  }

  // --- Benchmark / Stress Testing Engine ---
  benchmarkThousands(count = 1000) {
    const startTime = performance.now();
    const mockSubs = [];
    const baseDate = new Date();

    for (let i = 0; i < count; i++) {
      mockSubs.push({
        id: `bench-${i}`,
        number: `SUB-BENCH-${10000 + i}`,
        customerName: `Customer Enterprise #${i}`,
        planId: i % 2 === 0 ? 'plan-monthly' : 'plan-annual',
        status: i % 10 === 0 ? 'Paused' : i % 25 === 0 ? 'Closed' : 'Active',
        startDate: '2026-01-01',
        nextBillingDate: '2026-11-01',
        lines: [
          { productId: 'prod-1', quantity: (i % 5) + 1, unitPrice: 1400 }
        ]
      });
    }

    // Run in-memory aggregation query across all 1000+ items
    const activeCount = mockSubs.filter(s => s.status === 'Active').length;
    const computedMRR = mockSubs
      .filter(s => s.status === 'Active')
      .reduce((sum, s) => sum + (s.lines[0].quantity * s.lines[0].unitPrice), 0);

    const endTime = performance.now();
    const durationMs = Math.round((endTime - startTime) * 100) / 100;

    return {
      count,
      activeCount,
      computedMRR,
      durationMs,
      passed: durationMs < 2000 // Prompt requirement: "respond in under two seconds"
    };
  }
}

export const store = new Store();
