// src/hooks/useCart.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { toast } from 'react-toastify';

// Create Context
const CartContext = createContext();

// Provider Component
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // ✅ UPDATED: Add to Cart Function with better stock handling
  const addToCart = useCallback(async (product) => {
    try {
      if (!product || !product.id) {
        toast.error("Invalid product data");
        return { success: false, message: "Invalid product data" };
      }

      // Check if product is available
      if (product.stock <= 0) {
        toast.error("Product is out of stock");
        return { success: false, message: "Product is out of stock" };
      }

      // Check if product is already in cart
      const existingItem = cartItems.find((item) => item.id === product.id);

      if (existingItem) {
        // Check if we have enough stock
        if (existingItem.quantity >= product.stock) {
          toast.error("Not enough stock available");
          return { success: false, message: "Not enough stock available" };
        }
        
        // Increment quantity
        const updatedCart = cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        setCartItems(updatedCart);
        toast.success(`${product.name} quantity updated in cart`);
      } else {
        // Add new item
        setCartItems([...cartItems, { ...product, quantity: 1 }]);
        toast.success(`${product.name} added to cart`);
      }

      return { success: true, message: `${product.name} added to cart` };
    } catch (error) {
      console.error("❌ Add to Cart Error:", error);
      toast.error("Failed to add to cart");
      return { success: false, message: "Something went wrong adding to cart" };
    }
  }, [cartItems]);

  // ✅ UPDATED: Remove from Cart
  const removeFromCart = useCallback((productId) => {
    setCartItems(prevItems => prevItems.filter((item) => item.id !== productId));
    toast.info("Item removed from cart");
  }, []);

  // ✅ UPDATED: Clear Cart
  const clearCart = useCallback(() => {
    setCartItems([]);
    // Also clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem("cart");
    }
    toast.info("Cart cleared");
  }, []);

  // ✅ UPDATED: Update Quantity Function
  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  }, [removeFromCart]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
  }), [cartItems, addToCart, removeFromCart, clearCart, updateQuantity]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Hook to use CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};