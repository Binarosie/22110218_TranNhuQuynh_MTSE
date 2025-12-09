/**
 * Cart calculation utilities
 */

/**
 * Calculate total for a single cart item
 * @param {Object} item - Cart item
 * @returns {number} Total amount
 */
export const calculateItemTotal = (item) => {
  const rentTotal = item.price * item.months;
  const depositTotal = item.deposit || 0;
  const maintenanceTotal = (item.maintenanceFee || 0) * item.months;
  return rentTotal + depositTotal + maintenanceTotal;
};

/**
 * Calculate totals for all cart items
 * @param {Array} items - Cart items
 * @returns {Object} Totals breakdown
 */
export const calculateCartTotals = (items) => {
  const totals = {
    rentTotal: 0,
    depositTotal: 0,
    maintenanceTotal: 0,
    grandTotal: 0,
    selectedCount: 0,
    totalCount: items.length,
  };

  items.forEach((item) => {
    const rentAmount = item.price * item.months;
    const depositAmount = item.deposit || 0;
    const maintenanceAmount = (item.maintenanceFee || 0) * item.months;

    totals.rentTotal += rentAmount;
    totals.depositTotal += depositAmount;
    totals.maintenanceTotal += maintenanceAmount;

    if (item.selected) {
      totals.selectedCount++;
    }
  });

  totals.grandTotal =
    totals.rentTotal + totals.depositTotal + totals.maintenanceTotal;

  return totals;
};

/**
 * Calculate monthly payment for rent
 * @param {number} monthlyRent - Monthly rent amount
 * @param {number} maintenanceFee - Monthly maintenance fee
 * @returns {number} Total monthly payment
 */
export const calculateMonthlyPayment = (monthlyRent, maintenanceFee = 0) => {
  return monthlyRent + maintenanceFee;
};

/**
 * Calculate deposit for rent
 * @param {number} monthlyRent - Monthly rent amount
 * @param {number} depositMonths - Number of months for deposit (default: 2)
 * @returns {number} Deposit amount
 */
export const calculateDeposit = (monthlyRent, depositMonths = 2) => {
  return monthlyRent * depositMonths;
};

/**
 * Calculate total rent cost
 * @param {number} monthlyRent - Monthly rent amount
 * @param {number} months - Lease term in months
 * @param {number} maintenanceFee - Monthly maintenance fee
 * @param {number} depositMonths - Number of months for deposit
 * @returns {Object} Breakdown of costs
 */
export const calculateRentCost = (
  monthlyRent,
  months,
  maintenanceFee = 0,
  depositMonths = 2
) => {
  const rentTotal = monthlyRent * months;
  const maintenanceTotal = maintenanceFee * months;
  const deposit = calculateDeposit(monthlyRent, depositMonths);
  const grandTotal = rentTotal + maintenanceTotal + deposit;

  return {
    rentTotal,
    maintenanceTotal,
    deposit,
    grandTotal,
    monthlyPayment: calculateMonthlyPayment(monthlyRent, maintenanceFee),
  };
};

/**
 * Calculate selected items totals only
 * @param {Array} items - Cart items
 * @returns {Object} Selected totals
 */
export const calculateSelectedTotals = (items) => {
  const selectedItems = items.filter((item) => item.selected);
  return calculateCartTotals(selectedItems);
};

/**
 * Format price to VND currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted price
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Calculate price per square meter
 * @param {number} price - Total price
 * @param {number} area - Area in m²
 * @returns {number} Price per m²
 */
export const calculatePricePerSqm = (price, area) => {
  if (!area || area <= 0) return 0;
  return price / area;
};
