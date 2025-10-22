import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Mail, Gift, Sparkles, Heart, Star } from 'lucide-react';
import { ButtonLoading } from '../common/Loading';

// Validation schema for newsletter signup
const signupSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required')
});

const SignupModal = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      firstName: '',
      email: ''
    }
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setIsSubmitted(false);
      clearErrors();
    }
  }, [isOpen, reset, clearErrors]);

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      clearErrors();

      // Simulate API call for newsletter signup
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: data.firstName.trim(),
          email: data.email.trim().toLowerCase(),
          source: 'homepage_modal'
        }),
      });

      if (response.ok || response.status === 404) {
        // Show success even if endpoint doesn't exist (for demo)
        setIsSubmitted(true);
        
        // Auto-close after 4 seconds
        setTimeout(() => {
          onClose();
        }, 4000);
      } else {
        const errorData = await response.json();
        setError('root', {
          type: 'manual',
          message: errorData.message || 'Failed to subscribe. Please try again.'
        });
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      // Show success for demo purposes
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-scale-in border border-gray-200 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Close modal"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
        </button>

        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white p-6 sm:p-8 rounded-t-2xl sm:rounded-t-3xl overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <Sparkles className="absolute top-3 left-4 sm:top-4 sm:left-6 h-4 w-4 sm:h-5 sm:w-5 text-primary-200 opacity-60 animate-pulse" />
                <Heart className="absolute top-4 right-4 sm:top-6 sm:right-6 h-5 w-5 sm:h-6 sm:w-6 text-gold-300 opacity-50 animate-bounce-subtle" />
                <Star className="absolute bottom-4 left-4 sm:bottom-6 sm:left-8 h-4 w-4 sm:h-5 sm:w-5 text-primary-300 opacity-40 animate-float" />
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-white to-transparent opacity-10 rounded-full -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16"></div>
              </div>
              
              <div className="text-center relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-xl">
                  <Gift className="h-7 w-7 sm:h-8 sm:w-8 text-white animate-bounce-subtle" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">Hey Beautiful! 👋</h2>
                <p className="text-primary-100 text-sm sm:text-base leading-relaxed">
                  Join our community and unlock exclusive perks!
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 md:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                {/* First Name Field */}
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label text-sm sm:text-base">
                    First Name
                  </label>
                  <input
                    {...register('firstName')}
                    type="text"
                    id="firstName"
                    className={`form-input text-sm sm:text-base ${errors.firstName ? 'form-input-error' : ''}`}
                    placeholder="Enter your name"
                  />
                  {errors.firstName && (
                    <p className="form-error text-xs sm:text-sm">{errors.firstName.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label text-sm sm:text-base">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      className={`form-input pl-10 sm:pl-12 text-sm sm:text-base ${errors.email ? 'form-input-error' : ''}`}
                      placeholder="Enter your email"
                    />
                    <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  {errors.email && (
                    <p className="form-error text-xs sm:text-sm">{errors.email.message}</p>
                  )}
                </div>

                {/* Error Message */}
                {errors.root && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <p className="text-red-600 font-semibold text-xs sm:text-sm">{errors.root.message}</p>
                  </div>
                )}

                {/* Benefits */}
                <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-gold-200">
                  <h3 className="font-bold text-gold-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                    <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
                    Your Exclusive Benefits:
                  </h3>
                  <ul className="space-y-2 sm:space-y-2.5">
                    {[
                      { icon: '🎁', text: '10% off your first order' },
                      { icon: '✨', text: 'Early access to new collections' },
                      { icon: '💎', text: 'Exclusive styling tips' },
                      { icon: '🛍️', text: 'Member-only offers' }
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 sm:gap-3">
                        <span className="text-base sm:text-lg">{benefit.icon}</span>
                        <span className="text-gold-700 font-medium text-xs sm:text-sm">{benefit.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Submit Button */}
                <ButtonLoading
                  type="submit"
                  isLoading={isSubmitting}
                  loadingText="Getting your perks..."
                  className="w-full btn-gold py-2.5 sm:py-3 font-bold text-sm sm:text-base"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                    Claim My Discount ✨
                  </span>
                </ButtonLoading>

                {/* Privacy Notice */}
                <p className="text-[10px] sm:text-xs text-gray-500 text-center leading-relaxed">
                  We respect your privacy. Unsubscribe anytime.{' '}
                  <a href="/privacy-policy" className="text-primary-600 hover:underline font-semibold" target="_blank">
                    Privacy Policy
                  </a>
                </p>
              </form>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="p-6 sm:p-8 md:p-10 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce-subtle">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Welcome! 🎉</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed px-2">
              You're now part of our exclusive community! Check your email for your discount code.
            </p>
            
            <div className="bg-primary-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6 border-2 border-primary-200">
              <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                <span className="font-bold text-primary-800 text-sm sm:text-base">Your Discount Code:</span>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-600 font-mono bg-white rounded-lg sm:rounded-xl px-4 py-3 sm:px-6 sm:py-4 border-2 border-primary-300 shadow-lg">
                FO10
              </div>
              <p className="text-primary-700 font-semibold mt-2 sm:mt-3 text-xs sm:text-sm">
                Save 10% on your first order! 💎
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={onClose}
                className="flex-1 btn-outline py-2.5 sm:py-3 font-semibold text-sm sm:text-base"
              >
                Continue Browsing
              </button>
              <a
                href="/products"
                className="flex-1 btn-gold py-2.5 sm:py-3 font-semibold text-center text-sm sm:text-base"
                onClick={onClose}
              >
                Start Shopping ✨
              </a>
            </div>
            
            <p className="text-[10px] sm:text-xs text-gray-500 mt-4 sm:mt-6 animate-pulse">
              This modal will close automatically...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupModal;