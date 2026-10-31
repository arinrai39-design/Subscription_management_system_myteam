export const initialData = {
  company: {
    name: "Brightloop Software Inc.",
    tagline: "Subscription & Recurring Billing Operating System",
    address: "742 Innovation Way, Suite 400, San Francisco, CA 94107",
    email: "billing@brightloop.com",
    phone: "+1 (555) 839-2040",
    currency: "USD",
    currencySymbol: "$"
  },

  currentUser: {
    id: "usr-admin",
    name: "Alex Vance",
    email: "alex.admin@brightloop.com",
    role: "admin", // 'admin' | 'staff' | 'customer'
    companyName: "Brightloop Software"
  },

  users: [
    {
      id: "usr-admin",
      name: "Alex Vance",
      email: "alex.admin@brightloop.com",
      role: "admin",
      companyName: "Brightloop HQ",
      createdAt: "2026-01-01"
    },
    {
      id: "usr-staff",
      name: "Sarah Jenkins",
      email: "sarah.sales@brightloop.com",
      role: "staff",
      companyName: "Brightloop Sales & Support",
      createdAt: "2026-02-15"
    },
    {
      id: "usr-cust-1",
      name: "Dave Miller",
      email: "dave@smallshop.com",
      role: "customer",
      companyName: "TechNova Small Shop",
      phone: "+1 (555) 234-5678",
      address: "104 Market Street, Austin, TX",
      createdAt: "2026-03-10"
    },
    {
      id: "usr-cust-2",
      name: "Lisa Ray",
      email: "lisa@acmeretail.com",
      role: "customer",
      companyName: "Acme Retail Enterprises",
      phone: "+1 (555) 987-6543",
      address: "88 Broadway Ave, New York, NY",
      createdAt: "2026-04-01"
    }
  ],

  products: [
    {
      id: "prod-1",
      name: "Brightloop Core ERP",
      type: "Software",
      salesPrice: 1400,
      costPrice: 350,
      notes: "Cloud ERP core subscription covering CRM, Sales, and Invoicing.",
      variants: [
        { id: "var-std", name: "Standard Edition", extraPrice: 0 },
        { id: "var-odoo", name: "Odoo Enterprise Brand", extraPrice: 560 }, // Scene 2: choosing Odoo brand adds 560
        { id: "var-ai", name: "AI Autopilot Edition", extraPrice: 950 }
      ]
    },
    {
      id: "prod-2",
      name: "Advanced Analytics & BI",
      type: "Add-on",
      salesPrice: 250,
      costPrice: 40,
      notes: "Automated executive dashboards, custom reporting and cohort churn analytics.",
      variants: [
        { id: "var-bi-std", name: "Standard BI", extraPrice: 0 }
      ]
    },
    {
      id: "prod-3",
      name: "Dedicated Account Support",
      type: "Service",
      salesPrice: 500,
      costPrice: 200,
      notes: "24/7 designated solutions engineer with 15-minute guaranteed SLA response.",
      variants: [
        { id: "var-support-std", name: "Standard 24/7", extraPrice: 0 }
      ]
    },
    {
      id: "prod-4",
      name: "API & Webhooks Pro",
      type: "Add-on",
      salesPrice: 150,
      costPrice: 20,
      notes: "High-throughput API endpoints with 100,000 calls/day and real-time webhook routing.",
      variants: [
        { id: "var-api-std", name: "Standard API", extraPrice: 0 }
      ]
    },
    {
      id: "prod-5",
      name: "Multi-Warehouse Inventory",
      type: "Add-on",
      salesPrice: 320,
      costPrice: 60,
      notes: "Real-time stock level synchronization across up to 10 physical distribution centers.",
      variants: [
        { id: "var-wh-std", name: "Standard Multi-WH", extraPrice: 0 }
      ]
    }
  ],

  plans: [
    {
      id: "plan-monthly",
      name: "Monthly Growth SaaS",
      billingFrequency: "monthly", // daily, weekly, monthly, yearly
      price: 1400,
      minQuantity: 1,
      availableFrom: "2026-01-01",
      availableTo: "2027-12-31",
      rules: {
        autoCloseOnEnd: false,
        allowEarlyClose: true,
        allowPause: true,
        allowRenewal: true
      }
    },
    {
      id: "plan-annual",
      name: "Annual Enterprise Contract",
      billingFrequency: "yearly",
      price: 14000,
      minQuantity: 5,
      availableFrom: "2026-01-01",
      availableTo: "2027-12-31",
      rules: {
        autoCloseOnEnd: true,
        allowEarlyClose: false,
        allowPause: false,
        allowRenewal: true
      }
    },
    {
      id: "plan-weekly",
      name: "Weekly Startup Pilot",
      billingFrequency: "weekly",
      price: 350,
      minQuantity: 1,
      availableFrom: "2026-01-01",
      availableTo: "2026-12-31",
      rules: {
        autoCloseOnEnd: true,
        allowEarlyClose: true,
        allowPause: true,
        allowRenewal: true
      }
    },
    {
      id: "plan-daily",
      name: "Daily High-Compute Batch",
      billingFrequency: "daily",
      price: 65,
      minQuantity: 10,
      availableFrom: "2026-01-01",
      availableTo: "2026-12-31",
      rules: {
        autoCloseOnEnd: true,
        allowEarlyClose: true,
        allowPause: false,
        allowRenewal: false
      }
    }
  ],

  quotationTemplates: [
    {
      id: "tmpl-1",
      name: "Enterprise Full Cloud Suite",
      planId: "plan-annual",
      validityDays: 30,
      notes: "Standard agreement for high-growth mid-market enterprises.",
      lines: [
        { productId: "prod-1", variantId: "var-odoo", quantity: 5, unitPrice: 1960 },
        { productId: "prod-2", variantId: "var-bi-std", quantity: 5, unitPrice: 250 },
        { productId: "prod-3", variantId: "var-support-std", quantity: 1, unitPrice: 500 }
      ]
    },
    {
      id: "tmpl-2",
      name: "Startup Core SaaS Package",
      planId: "plan-monthly",
      validityDays: 15,
      notes: "Turnkey monthly package for early stage teams.",
      lines: [
        { productId: "prod-1", variantId: "var-std", quantity: 2, unitPrice: 1400 },
        { productId: "prod-4", variantId: "var-api-std", quantity: 1, unitPrice: 150 }
      ]
    },
    {
      id: "tmpl-3",
      name: "Weekly Rapid Proof-of-Concept",
      planId: "plan-weekly",
      validityDays: 7,
      notes: "Zero-commitment trial offering for evaluation.",
      lines: [
        { productId: "prod-1", variantId: "var-std", quantity: 1, unitPrice: 350 }
      ]
    }
  ],

  taxes: [
    { id: "tax-vat", name: "VAT (10%)", rate: 0.10, isDefault: true },
    { id: "tax-gst", name: "GST (18%)", rate: 0.18, isDefault: false },
    { id: "tax-us", name: "Sales Tax (8.25%)", rate: 0.0825, isDefault: false },
    { id: "tax-zero", name: "Tax Exempt (0%)", rate: 0.0, isDefault: false }
  ],

  discounts: [
    {
      id: "disc-1",
      code: "SEAT15",
      name: "Multi-Seat Volume Tier (15% Off)",
      type: "percentage", // 'percentage' | 'fixed'
      value: 15,
      minPurchase: 0,
      minQuantity: 5,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      maxUsageCount: 50,
      currentUsageCount: 8,
      scope: "subscription", // 'subscription' | 'product'
      targetProductId: null
    },
    {
      id: "disc-2",
      code: "WELCOME200",
      name: "New Enterprise Credit ($200 Off)",
      type: "fixed",
      value: 200,
      minPurchase: 1000,
      minQuantity: 1,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      maxUsageCount: 25,
      currentUsageCount: 14,
      scope: "subscription",
      targetProductId: null
    },
    {
      id: "disc-3",
      code: "PROMO_BI50",
      name: "Analytics Add-on Promo ($50 Off)",
      type: "fixed",
      value: 50,
      minPurchase: 0,
      minQuantity: 1,
      startDate: "2026-06-01",
      endDate: "2026-12-31",
      maxUsageCount: 100,
      currentUsageCount: 19,
      scope: "product",
      targetProductId: "prod-2"
    }
  ],

  subscriptions: [
    {
      id: "sub-1",
      number: "SUB-2026-0001",
      customerId: "usr-cust-1",
      customerName: "Dave Miller",
      companyName: "TechNova Small Shop",
      planId: "plan-monthly",
      status: "Active", // Draft, Quotation, Confirmed, Active, Paused, Closed
      startDate: "2026-10-01",
      expiryDate: "2027-10-01",
      nextBillingDate: "2026-11-01",
      paymentTerms: "Immediate",
      lastBilledDate: "2026-10-01",
      lines: [
        { productId: "prod-1", variantId: "var-odoo", quantity: 3, unitPrice: 1960, taxId: "tax-vat" },
        { productId: "prod-2", variantId: "var-bi-std", quantity: 3, unitPrice: 250, taxId: "tax-vat" }
      ],
      appliedDiscountCode: "SEAT15",
      notes: "Customer specifically requested Odoo enterprise brand variant."
    },
    {
      id: "sub-2",
      number: "SUB-2026-0002",
      customerId: "usr-cust-2",
      customerName: "Lisa Ray",
      companyName: "Acme Retail Enterprises",
      planId: "plan-annual",
      status: "Active",
      startDate: "2026-06-01",
      expiryDate: "2027-06-01",
      nextBillingDate: "2026-11-01",
      paymentTerms: "30 Days",
      lastBilledDate: "2026-06-01",
      lines: [
        { productId: "prod-1", variantId: "var-odoo", quantity: 10, unitPrice: 1960, taxId: "tax-vat" },
        { productId: "prod-5", variantId: "var-wh-std", quantity: 2, unitPrice: 320, taxId: "tax-vat" }
      ],
      appliedDiscountCode: "SEAT15",
      notes: "Annual master services agreement."
    },
    {
      id: "sub-3",
      number: "SUB-2026-0003",
      customerId: "usr-cust-1",
      customerName: "Dave Miller",
      companyName: "TechNova Small Shop",
      planId: "plan-monthly",
      status: "Quotation",
      startDate: "2026-10-25",
      expiryDate: "2026-11-15",
      nextBillingDate: "2026-11-25",
      paymentTerms: "15 Days",
      lastBilledDate: null,
      lines: [
        { productId: "prod-1", variantId: "var-std", quantity: 5, unitPrice: 1400, taxId: "tax-vat" },
        { productId: "prod-4", variantId: "var-api-std", quantity: 2, unitPrice: 150, taxId: "tax-vat" }
      ],
      appliedDiscountCode: "SEAT15",
      notes: "Draft offer pending board approval."
    },
    {
      id: "sub-4",
      number: "SUB-2026-0004",
      customerId: "usr-cust-2",
      customerName: "Lisa Ray",
      companyName: "Acme Retail Enterprises",
      planId: "plan-weekly",
      status: "Draft",
      startDate: "2026-10-30",
      expiryDate: "2026-11-07",
      nextBillingDate: "2026-11-07",
      paymentTerms: "Immediate",
      lastBilledDate: null,
      lines: [
        { productId: "prod-1", variantId: "var-std", quantity: 2, unitPrice: 350, taxId: "tax-vat" }
      ],
      appliedDiscountCode: null,
      notes: "Initial quote draft."
    },
    {
      id: "sub-5",
      number: "SUB-2026-0005",
      customerId: "usr-cust-1",
      customerName: "Dave Miller",
      companyName: "TechNova Small Shop",
      planId: "plan-monthly",
      status: "Paused",
      startDate: "2026-08-01",
      expiryDate: "2027-08-01",
      nextBillingDate: "2026-12-01",
      paymentTerms: "Immediate",
      lastBilledDate: "2026-09-01",
      lines: [
        { productId: "prod-1", variantId: "var-std", quantity: 4, unitPrice: 1400, taxId: "tax-vat" }
      ],
      appliedDiscountCode: null,
      pauseReason: "Temporary warehouse remodel during Q4"
    },
    {
      id: "sub-6",
      number: "SUB-2026-0006",
      customerId: "usr-cust-2",
      customerName: "Lisa Ray",
      companyName: "Acme Retail Enterprises",
      planId: "plan-weekly",
      status: "Closed",
      startDate: "2026-09-01",
      expiryDate: "2026-10-01",
      nextBillingDate: null,
      paymentTerms: "Immediate",
      lastBilledDate: "2026-09-22",
      lines: [
        { productId: "prod-1", variantId: "var-std", quantity: 1, unitPrice: 350, taxId: "tax-vat" }
      ],
      appliedDiscountCode: null,
      notes: "Completed 4-week pilot successfully."
    }
  ],

  invoices: [
    {
      id: "inv-1",
      number: "INV-2026-0001",
      subscriptionId: "sub-1",
      subscriptionNumber: "SUB-2026-0001",
      customerId: "usr-cust-1",
      customerName: "Dave Miller",
      companyName: "TechNova Small Shop",
      billingPeriod: "2026-10-01 to 2026-10-31",
      invoiceDate: "2026-10-01",
      dueDate: "2026-10-01",
      status: "Paid", // Draft, Confirmed, Paid, Cancelled
      subtotal: 6630,
      discountAmount: 994.50, // 15% discount
      taxAmount: 563.55,
      total: 6200.05,
      amountPaid: 6200.05,
      lines: [
        { description: "Brightloop Core ERP (Odoo Enterprise Brand)", quantity: 3, unitPrice: 1960, amount: 5880 },
        { description: "Advanced Analytics & BI", quantity: 3, unitPrice: 250, amount: 750 }
      ],
      payments: [
        {
          id: "pay-1",
          date: "2026-10-01",
          method: "Credit Card",
          amount: 6200.05,
          note: "Stripe Auth #ch_3Ok29zLkd82"
        }
      ]
    },
    {
      id: "inv-2",
      number: "INV-2026-0002",
      subscriptionId: "sub-2",
      subscriptionNumber: "SUB-2026-0002",
      customerId: "usr-cust-2",
      customerName: "Lisa Ray",
      companyName: "Acme Retail Enterprises",
      billingPeriod: "2026-06-01 to 2027-06-01",
      invoiceDate: "2026-06-01",
      dueDate: "2026-07-01",
      status: "Paid",
      subtotal: 20240,
      discountAmount: 3036,
      taxAmount: 1720.40,
      total: 18924.40,
      amountPaid: 18924.40,
      lines: [
        { description: "Brightloop Core ERP (Odoo Enterprise Brand)", quantity: 10, unitPrice: 1960, amount: 19600 },
        { description: "Multi-Warehouse Inventory", quantity: 2, unitPrice: 320, amount: 640 }
      ],
      payments: [
        {
          id: "pay-2",
          date: "2026-06-10",
          method: "Bank Transfer",
          amount: 18924.40,
          note: "Wire Ref: WT-2026-99214 JPMorgan"
        }
      ]
    },
    {
      id: "inv-3",
      number: "INV-2026-0003",
      subscriptionId: "sub-1",
      subscriptionNumber: "SUB-2026-0001",
      customerId: "usr-cust-1",
      customerName: "Dave Miller",
      companyName: "TechNova Small Shop",
      billingPeriod: "2026-09-01 to 2026-09-30",
      invoiceDate: "2026-09-01",
      dueDate: "2026-09-15", // OVERDUE!
      status: "Confirmed",
      subtotal: 6630,
      discountAmount: 994.50,
      taxAmount: 563.55,
      total: 6200.05,
      amountPaid: 0,
      lines: [
        { description: "Brightloop Core ERP (Odoo Enterprise Brand)", quantity: 3, unitPrice: 1960, amount: 5880 },
        { description: "Advanced Analytics & BI", quantity: 3, unitPrice: 250, amount: 750 }
      ],
      payments: []
    },
    {
      id: "inv-4",
      number: "INV-2026-0004",
      subscriptionId: "sub-2",
      subscriptionNumber: "SUB-2026-0002",
      customerId: "usr-cust-2",
      customerName: "Lisa Ray",
      companyName: "Acme Retail Enterprises",
      billingPeriod: "2026-10-01 to 2026-10-31",
      invoiceDate: "2026-10-01",
      dueDate: "2026-10-20", // Partially paid & Overdue!
      status: "Confirmed",
      subtotal: 4200,
      discountAmount: 200,
      taxAmount: 400,
      total: 4400,
      amountPaid: 2000,
      lines: [
        { description: "Professional Services & SLA", quantity: 1, unitPrice: 4200, amount: 4200 }
      ],
      payments: [
        {
          id: "pay-3",
          date: "2026-10-05",
          method: "Bank Transfer",
          amount: 2000,
          note: "Partial payment install 1/2"
        }
      ]
    },
    {
      id: "inv-5",
      number: "INV-2026-0005",
      subscriptionId: "sub-1",
      subscriptionNumber: "SUB-2026-0001",
      customerId: "usr-cust-1",
      customerName: "Dave Miller",
      companyName: "TechNova Small Shop",
      billingPeriod: "2026-11-01 to 2026-11-30",
      invoiceDate: "2026-10-30",
      dueDate: "2026-11-15",
      status: "Draft",
      subtotal: 6630,
      discountAmount: 994.50,
      taxAmount: 563.55,
      total: 6200.05,
      amountPaid: 0,
      lines: [
        { description: "Brightloop Core ERP (Odoo Enterprise Brand)", quantity: 3, unitPrice: 1960, amount: 5880 },
        { description: "Advanced Analytics & BI", quantity: 3, unitPrice: 250, amount: 750 }
      ],
      payments: []
    }
  ],

  notifications: [
    {
      id: "notif-1",
      type: "invoice",
      recipient: "dave@smallshop.com",
      subject: "Invoice INV-2026-0001 from Brightloop Software",
      body: "Hello Dave, your invoice for October is ready. Total: $6,200.05. Paid via Credit Card. Thank you for your partnership!",
      date: "2026-10-01 09:00",
      read: false
    },
    {
      id: "notif-2",
      type: "reminder",
      recipient: "dave@smallshop.com",
      subject: "Action Required: Overdue Invoice INV-2026-0003 ($6,200.05)",
      body: "Hello Dave, our records indicate invoice INV-2026-0003 due on Sep 15, 2026 remains unpaid. Please register payment to avoid service interruption.",
      date: "2026-10-16 11:30",
      read: false
    },
    {
      id: "notif-3",
      type: "reset",
      recipient: "lisa@acmeretail.com",
      subject: "Password Reset Request for Brightloop Portal",
      body: "Click the secure link below to reset your Brightloop account password: <a href='#reset-token-xyz991'>Reset Password Now</a> (Valid for 60 minutes).",
      date: "2026-10-29 14:15",
      token: "xyz991",
      read: false
    }
  ]
};
