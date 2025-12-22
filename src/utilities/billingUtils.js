/**
 * Billing utility functions for handling price conditions gracefully
 * across different payment methods and currencies (PKR, USD)
 */

// Currency mapping for display
export const currencyMap = {
  pkr: "Rs",
  usd: "USD",
  USD: "USD",
  PKR: "Rs",
  // Add more currencies as needed
};

/**
 * Format price based on billing data and currency
 * @param {Object} bill - The billing object containing transaction metadata
 * @param {string} fallbackCurrency - Fallback currency code if not found in bill
 * @returns {Object} - Formatted price object with amount and symbol
 */
export const formatBillingPrice = (bill, fallbackCurrency = "pkr") => {
  if (!bill) {
    return {
      amount: "0",
      symbol: currencyMap[fallbackCurrency.toLowerCase()] || "Rs",
      currency: fallbackCurrency.toLowerCase(),
      formatted: `${currencyMap[fallbackCurrency.toLowerCase()] || "Rs"} 0`,
      error: "Invalid billing data"
    };
  }

  const { txnMeta } = bill;
  let amount = 0;
  let currency = fallbackCurrency.toLowerCase();
  let symbol = currencyMap[currency] || "Rs";

  try {
    // Stripe gateway
    if (txnMeta?.stripeSessionId || bill.billingMeta?.stripeMeta) {
      amount = txnMeta?.amount || bill.billingMeta?.stripeMeta?.packagePrice || 0;
      // Prioritize billingMeta currency for display consistency
      currency = (bill.billingMeta?.stripeMeta?.currency || txnMeta?.currency || fallbackCurrency).toLowerCase();
      symbol = currencyMap[currency] || currency.toUpperCase();
    }
    // PayFast gateway
    else if (txnMeta?.gateway === "payfast" || bill.billingMeta?.payfastMeta) {
      amount = txnMeta?.amount || bill.billingMeta?.payfastMeta?.amount || bill.billingMeta?.payfastMeta?.packagePrice || 0;
      // Prioritize billingMeta currency for display consistency
      currency = (bill.billingMeta?.payfastMeta?.currency || txnMeta?.currency || fallbackCurrency).toLowerCase();
      symbol = currencyMap[currency] || currency.toUpperCase();
    }
    // Sahulat gateway
    else if (txnMeta?.gateway === "sahulat") {
      amount = txnMeta.response?.amount || 0;
      currency = (txnMeta.response?.currency || fallbackCurrency).toLowerCase();
      symbol = currencyMap[currency] || currency.toUpperCase();
    }
    // PayPro gateway
    else if (txnMeta?.gateway === "paypro") {
      amount = txnMeta.response?.amount || 0;
      currency = (txnMeta.response?.currency || fallbackCurrency).toLowerCase();
      symbol = currencyMap[currency] || currency.toUpperCase();
    }
    // Handle pending payments without txnMeta
    else if (bill.billingMeta?.stripeMeta) {
      amount = bill.billingMeta.stripeMeta.packagePrice || 0;
      currency = (bill.billingMeta.stripeMeta.currency || fallbackCurrency).toLowerCase();
      symbol = currencyMap[currency] || currency.toUpperCase();
    }
    else if (bill.billingMeta?.payfastMeta) {
      amount = bill.billingMeta.payfastMeta.packagePrice || 0;
      currency = (bill.billingMeta.payfastMeta.currency || fallbackCurrency).toLowerCase();
      symbol = currencyMap[currency] || currency.toUpperCase();
    }
    // Fallback
    else {
      amount = txnMeta?.amount || bill.billingMeta?.stripeMeta?.packagePrice || 0;
      // Prioritize billingMeta currency for display consistency
      currency = (bill.billingMeta?.stripeMeta?.currency || txnMeta?.currency || fallbackCurrency).toLowerCase();
      symbol = currencyMap[currency] || currency.toUpperCase();
    }

    return {
      amount: amount.toString(),
      symbol,
      currency,
      formatted: `${symbol} ${amount}`,
      gateway: txnMeta?.gateway || (bill.billingMeta?.stripeMeta ? "stripe" : (bill.billingMeta?.payfastMeta ? "payfast" : "unknown")),
      error: null
    };

  } catch (error) {
    import('../services/logger').then(m => m.default.error("Error formatting billing price:", error));
    return {
      amount: "0",
      symbol: currencyMap[fallbackCurrency.toLowerCase()] || "Rs",
      currency: fallbackCurrency.toLowerCase(),
      formatted: `${currencyMap[fallbackCurrency.toLowerCase()] || "Rs"} 0`,
      gateway: txnMeta?.gateway || "unknown",
      error: error.message
    };
  }
};

/**
 * Get payment method display information
 * @param {Object} bill - The billing object
 * @returns {Object} - Payment method info with name and display details
 */
export const getPaymentMethodInfo = (bill) => {
  if (!bill) {
    return {
      name: "Unknown",
      displayName: "Unknown Payment Method",
      gateway: null,
      details: null
    };
  }

  // Detect gateway from txnMeta or billingMeta
  let gateway = bill.txnMeta?.gateway?.toLowerCase();
  if (!gateway && bill.txnMeta?.stripeSessionId) gateway = "stripe";
  if (!gateway && bill.billingMeta?.stripeMeta) gateway = "stripe";
  if (!gateway && bill.billingMeta?.payfastMeta) gateway = "payfast";
  if (!gateway && bill.billingMethod) gateway = bill.billingMethod.toLowerCase();

  const paymentMethods = {
    stripe: {
      name: "stripe",
      displayName: "Stripe",
      gateway: "stripe",
      details: bill.billingMeta?.stripeMeta?.billingMethod || "Card Payment"
    },
    payfast: {
      name: "payfast",
      displayName: "PayFast",
      gateway: "payfast",
      details: "PayFast Payment"
    },
    sahulat: {
      name: "sahulat",
      displayName: "Sahulat",
      gateway: "sahulat",
      details: "Mobile Wallet / Bank Transfer"
    },
    paypro: {
      name: "paypro",
      displayName: "PayPro",
      gateway: "paypro",
      details: "Digital Payment"
    }
  };

  return paymentMethods[gateway] || {
    name: gateway || "unknown",
    displayName: gateway ? gateway.charAt(0).toUpperCase() + gateway.slice(1) : "Unknown",
    gateway: gateway || null,
    details: "Payment Method"
  };
};

/**
 * Validate billing data structure
 * @param {Object} bill - The billing object to validate
 * @returns {Object} - Validation result with status and errors
 */
export const validateBillingData = (bill) => {
  const errors = [];
  const warnings = [];

  if (!bill) {
    errors.push("Billing data is missing");
    return { isValid: false, errors, warnings };
  }

  // Check required fields
  if (!bill._id) warnings.push("Billing ID is missing");
  if (!bill.billingStatus) warnings.push("Billing status is missing");

  // Check transaction metadata
  if (!bill.txnMeta) {
    errors.push("Transaction metadata is missing");
  } else {
    if (!bill.txnMeta.gateway) {
      warnings.push("Payment gateway information is missing");
    }

    if (!bill.txnMeta.response) {
      warnings.push("Transaction response data is missing");
    }
  }

  // Check billing metadata
  if (!bill.billingMeta) {
    warnings.push("Billing metadata is missing");
  } else if (!bill.billingMeta.stripeMeta) {
    warnings.push("Stripe metadata is missing");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Get billing status with appropriate styling class
 * @param {string} status - The billing status
 * @returns {Object} - Status info with display text and CSS class
 */
export const getBillingStatusInfo = (status) => {
  const statusMap = {
    paid: {
      text: "Paid",
      class: "success",
      color: "#28a745"
    },
    pending: {
      text: "Pending",
      class: "warning",
      color: "#ffc107"
    },
    failed: {
      text: "Failed",
      class: "danger",
      color: "#dc3545"
    },
    cancelled: {
      text: "Cancelled",
      class: "secondary",
      color: "#6c757d"
    }
  };

  const normalizedStatus = status?.toLowerCase() || "unknown";
  return statusMap[normalizedStatus] || {
    text: status || "Unknown",
    class: "secondary",
    color: "#6c757d"
  };
};

/**
 * Format billing date with proper handling of invalid dates
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date or fallback text
 */
export const formatBillingDate = (dateString) => {
  if (!dateString || isNaN(new Date(dateString))) {
    return "N/A";
  }

  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    // Adding ordinal suffix
    let dayWithSuffix;
    if (day === 1 || day === 21 || day === 31) {
      dayWithSuffix = day + 'st';
    } else if (day === 2 || day === 22) {
      dayWithSuffix = day + 'nd';
    } else if (day === 3 || day === 23) {
      dayWithSuffix = day + 'rd';
    } else {
      dayWithSuffix = day + 'th';
    }

    return `${dayWithSuffix} ${month}, ${year}`;
  } catch (error) {
    import('../services/logger').then(m => m.default.error("Error formatting date:", error));
    return "Invalid Date";
  }
};

/**
 * Calculate billing summary for multiple bills
 * @param {Array} bills - Array of billing objects
 * @returns {Object} - Summary with totals by currency and payment method
 */
export const calculateBillingSummary = (bills) => {
  if (!Array.isArray(bills) || bills.length === 0) {
    return {
      totalBills: 0,
      totalAmount: {},
      paymentMethods: {},
      statuses: {}
    };
  }

  const summary = {
    totalBills: bills.length,
    totalAmount: {},
    paymentMethods: {},
    statuses: {}
  };

  bills.forEach(bill => {
    // Calculate totals by currency
    const priceInfo = formatBillingPrice(bill);
    const currency = priceInfo.currency;
    const amount = parseFloat(priceInfo.amount) || 0;

    if (!summary.totalAmount[currency]) {
      summary.totalAmount[currency] = {
        amount: 0,
        symbol: priceInfo.symbol,
        count: 0
      };
    }
    summary.totalAmount[currency].amount += amount;
    summary.totalAmount[currency].count += 1;

    // Count payment methods
    const paymentMethod = getPaymentMethodInfo(bill);
    const methodKey = paymentMethod.gateway || 'unknown';
    summary.paymentMethods[methodKey] = (summary.paymentMethods[methodKey] || 0) + 1;

    // Count statuses
    const status = bill.billingStatus?.toLowerCase() || 'unknown';
    summary.statuses[status] = (summary.statuses[status] || 0) + 1;
  });

  return summary;
};

// Default export with all utilities
export default {
  formatBillingPrice,
  getPaymentMethodInfo,
  validateBillingData,
  getBillingStatusInfo,
  formatBillingDate,
  calculateBillingSummary,
  currencyMap
};