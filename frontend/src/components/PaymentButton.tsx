'use client';

import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentButtonProps {
  amount: number;
  teamId: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentButton = ({ 
  amount, 
  teamId, 
  onSuccess, 
  onError, 
  disabled,
  className 
}: PaymentButtonProps) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (disabled || loading) {
      console.log('Payment button clicked but disabled or loading');
      return;
    }

    console.log('Payment button clicked for team:', teamId, 'amount:', amount);
    setLoading(true);

    try {
      // Load Razorpay script
      const isRazorpayLoaded = await loadRazorpay();
      if (!isRazorpayLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

  // Create order on backend
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const response = await fetch(`${base}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
          teamId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const order = await response.json();

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'FragsHub',
        description: 'Tournament Entry Fee',
        image: '/logo.png',
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(`${base}/api/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                teamId,
              }),
            });

            if (verifyResponse.ok) {
              onSuccess(response.razorpay_payment_id);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            onError('Payment verification failed');
          }
        },
        prefill: {
          name: 'Team Captain',
          email: '',
          contact: '',
        },
        notes: {
          team_id: teamId,
        },
        theme: {
          color: '#FF4655',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      onError(error instanceof Error ? error.message : 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading}
      className={cn(
        'flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 disabled:bg-secondary-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none focus:outline-none focus:ring-2 focus:ring-primary-500',
        className
      )}
      type="button"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <CreditCard className="h-5 w-5" />
          <span>Pay ₹{amount}</span>
        </>
      )}
    </button>
  );
};

export default PaymentButton;
