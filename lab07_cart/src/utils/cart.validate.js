/**
 * Cart validation utilities
 */

/**
 * Validate cart item before adding
 * @param {Object} item - Cart item to validate
 * @returns {Object} { isValid: boolean, error?: string }
 */
export const validateCartItem = (item) => {
  // Required fields
  const requiredFields = [
    "apartmentId",
    "code",
    "title",
    "type",
    "area",
    "price",
    "mode",
    "status",
  ];

  for (const field of requiredFields) {
    if (!item[field]) {
      return {
        isValid: false,
        error: `Thiếu trường bắt buộc: ${field}`,
      };
    }
  }

  // Validate mode
  if (item.mode !== "rent") {
    return {
      isValid: false,
      error: 'Chế độ phải là "rent"',
    };
  }

  // Validate price
  if (typeof item.price !== "number" || item.price <= 0) {
    return {
      isValid: false,
      error: "Giá phải là số dương",
    };
  }

  // Validate months for rent mode
  if (!item.months || item.months < 1) {
    return {
      isValid: false,
      error: "Số tháng thuê phải lớn hơn 0",
    };
  }

  const minTerm = item.minLeaseTerm || 6;
  const maxTerm = item.maxLeaseTerm || 36;

  if (item.months < minTerm || item.months > maxTerm) {
    return {
      isValid: false,
      error: `Số tháng thuê phải từ ${minTerm} đến ${maxTerm}`,
    };
  }

  // Validate apartment availability (lab05 statuses: vacant, occupied, maintenance)
  if (!["vacant", "occupied", "maintenance"].includes(item.status)) {
    return {
      isValid: false,
      error: "Căn hộ không khả dụng",
    };
  }

  // Only vacant apartments can be rented
  if (item.status !== "vacant") {
    return {
      isValid: false,
      error: "Chỉ có thể thuê căn hộ trống",
    };
  }

  return { isValid: true };
};

/**
 * Validate apartment data from lab05 API
 * @param {Object} apartment - Apartment from lab05 BE
 * @returns {Object} { isValid: boolean, error?: string }
 */
export const validateApartment = (apartment) => {
  if (!apartment) {
    return {
      isValid: false,
      error: "Dữ liệu căn hộ không hợp lệ",
    };
  }

  // Check required fields from lab05 schema
  const requiredFields = [
    "id",
    "apartmentNumber",
    "type",
    "area",
    "status",
    "floor",
    "building",
    "block",
  ];

  for (const field of requiredFields) {
    if (!apartment[field]) {
      return {
        isValid: false,
        error: `Căn hộ thiếu thông tin: ${field}`,
      };
    }
  }

  // Check monthly rent
  if (!apartment.monthlyRent || apartment.monthlyRent <= 0) {
    return {
      isValid: false,
      error: "Căn hộ phải có giá thuê",
    };
  }

  return { isValid: true };
};

/**
 * Validate cart before checkout
 * @param {Array} items - Cart items
 * @returns {Object} { isValid: boolean, error?: string }
 */
export const validateCartForCheckout = (items) => {
  if (!items || items.length === 0) {
    return {
      isValid: false,
      error: "Giỏ hàng trống",
    };
  }

  const selectedItems = items.filter((item) => item.selected);

  if (selectedItems.length === 0) {
    return {
      isValid: false,
      error: "Chưa chọn căn hộ nào",
    };
  }

  // Validate each selected item
  for (const item of selectedItems) {
    const validation = validateCartItem(item);
    if (!validation.isValid) {
      return validation;
    }
  }

  return { isValid: true };
};
