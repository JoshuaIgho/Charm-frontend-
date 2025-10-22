// src/contexts/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import wishlistService from '../services/wishlistService';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children, userId }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load wishlist
  const loadWishlist = useCallback(async () => {
    if (!userId) {
      setWishlistItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await wishlistService.getUserWishlist(userId);
      if (response.success) {
        setWishlistItems(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error loading wishlist:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load on mount and when userId changes
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => item.product?.id === productId);
  }, [wishlistItems]);

  // Add to wishlist
  const addToWishlist = useCallback(async (productId) => {
    if (!userId) {
      toast.error('Please sign in to add items to wishlist');
      return { success: false };
    }

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    setWishlistItems(prev => [...prev, { 
      id: tempId, 
      product: { id: productId },
      addedAt: new Date().toISOString()
    }]);

    try {
      const response = await wishlistService.addToWishlist(userId, productId);
      
      if (response.success) {
        // Replace temp item with real data
        await loadWishlist();
        toast.success('Added to wishlist!');
        return { success: true };
      } else {
        // Revert optimistic update
        setWishlistItems(prev => prev.filter(item => item.id !== tempId));
        toast.error(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      // Revert optimistic update
      setWishlistItems(prev => prev.filter(item => item.id !== tempId));
      toast.error('Failed to add to wishlist');
      return { success: false, message: error.message };
    }
  }, [userId, loadWishlist]);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (wishlistItemId) => {
    // Optimistic update
    const originalItems = [...wishlistItems];
    setWishlistItems(prev => prev.filter(item => item.id !== wishlistItemId));

    try {
      const response = await wishlistService.removeFromWishlist(wishlistItemId);
      
      if (response.success) {
        toast.success('Removed from wishlist');
        return { success: true };
      } else {
        // Revert optimistic update
        setWishlistItems(originalItems);
        toast.error(response.message);
        return { success: false };
      }
    } catch (error) {
      // Revert optimistic update
      setWishlistItems(originalItems);
      toast.error('Failed to remove from wishlist');
      return { success: false };
    }
  }, [wishlistItems]);

  // Toggle wishlist (add if not present, remove if present)
  const toggleWishlist = useCallback(async (productId) => {
    const existingItem = wishlistItems.find(item => item.product?.id === productId);
    
    if (existingItem) {
      return await removeFromWishlist(existingItem.id);
    } else {
      return await addToWishlist(productId);
    }
  }, [wishlistItems, addToWishlist, removeFromWishlist]);

  const value = {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    isLoading,
    error,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};