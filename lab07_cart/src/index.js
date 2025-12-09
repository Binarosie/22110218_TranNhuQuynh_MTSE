/**
 * Lab07 Cart - Building Management Cart UI Library
 * Export all components, hooks, and utilities
 */

// Styles
import "./styles.css";

// UI Components
export { Button } from "./components/ui/Button";
export { TextInput } from "./components/ui/TextInput";
export { Card } from "./components/ui/Card";
export { Modal } from "./components/ui/Modal";

// Cart Components
export { CartItemCard } from "./components/CartItemCard";
export { CartSummary } from "./components/CartSummary";
export { ApartmentDetailCard } from "./components/ApartmentDetailCard";
export { LeaseTermSelector } from "./components/LeaseTermSelector";
export { PaymentBreakdown } from "./components/PaymentBreakdown";

// Hooks
export { useCart } from "./hooks/useCart";

// Adapters
export { createCartAdapter } from "./adapters/cart.adapter";
export { cartRestAdapter } from "./adapters/cart.rest";
export { cartGraphQLAdapter } from "./adapters/cart.graphql";

// Utilities
export {
  validateCartItem,
  validateApartment,
  validateCartForCheckout,
} from "./utils/cart.validate";

export {
  calculateItemTotal,
  calculateCartTotals,
  calculateMonthlyPayment,
  calculateDeposit,
  calculateRentCost,
  calculateSelectedTotals,
  formatPrice,
  calculatePricePerSqm,
} from "./utils/cart.calculate";
