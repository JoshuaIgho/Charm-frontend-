// utils/backendHealthCheck.js
import { API_URL } from '../services/api';

let isBackendReady = false;
let isCheckingHealth = false;

/**
 * Check if backend is awake and responding
 * Render free tier spins down after inactivity, this wakes it up
 */
export async function checkBackendHealth(showLoading = true) {
  if (isBackendReady) {
    return { ready: true };
  }

  if (isCheckingHealth) {
    // Wait for ongoing check to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!isCheckingHealth) {
          clearInterval(checkInterval);
          resolve({ ready: isBackendReady });
        }
      }, 500);
    });
  }

  isCheckingHealth = true;

  try {
    console.log('🏥 Checking backend health...');
    
    if (showLoading) {
      console.log('⏳ Backend may be waking up (Render free tier)...');
    }

    // Simple introspection query
    const healthQuery = `{ __typename }`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for cold starts

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: healthQuery }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Backend returned non-JSON response:', text.substring(0, 200));
      throw new Error('Backend is not responding with JSON. It may be starting up or experiencing issues.');
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ Backend returned errors:', result.errors);
      throw new Error(result.errors[0]?.message || 'Backend health check failed');
    }

    console.log('✅ Backend is healthy and ready!');
    isBackendReady = true;
    return { ready: true };

  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
    
    if (error.name === 'AbortError') {
      return { 
        ready: false, 
        error: 'Backend is taking too long to respond. It may be waking up from sleep. Please try again in a moment.',
        retryable: true
      };
    }

    return { 
      ready: false, 
      error: error.message,
      retryable: true
    };
  } finally {
    isCheckingHealth = false;
  }
}

/**
 * Reset health check status (useful for testing or after errors)
 */
export function resetBackendHealth() {
  isBackendReady = false;
}

/**
 * Higher-order function to wrap GraphQL requests with health check
 */
export function withHealthCheck(requestFn) {
  return async (...args) => {
    const health = await checkBackendHealth();
    
    if (!health.ready) {
      throw new Error(health.error || 'Backend is not available');
    }
    
    return requestFn(...args);
  };
}

// Export for use in other components
export { isBackendReady, isCheckingHealth };
export default checkBackendHealth;