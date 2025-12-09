import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useCart } from "@yourname/lab07-cart";
import { useAuth } from "./AuthContext";
import Cookies from "js-cookie";
import "@yourname/lab07-cart/dist/index.css";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const getToken = useCallback(() => {
    return Cookies.get("token");
  }, []);

  const cartConfig = useMemo(() => ({
    mode: "rest",
    baseURL: "http://localhost:5000",
    getToken,
    autoSync: false,
    enabled: !!user,
  }), [user, getToken]);

  const cart = useCart(cartConfig);

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext must be used within CartProvider");
  return ctx;
};
