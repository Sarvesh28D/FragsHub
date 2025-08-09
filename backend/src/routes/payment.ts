import { Router, Request, Response } from 'express';
import * as admin from 'firebase-admin';
// @ts-ignore
import Razorpay from 'razorpay';
import { createHash, createHmac } from 'crypto';

const router = Router();
const db = admin.firestore();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Create payment order
router.post('/create-order', async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, teamId } = req.body;

    if (!amount || !teamId) {
      res.status(400).json({
        error: 'Amount and teamId are required'
      });
      return;
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount, // Amount in paise
      currency: 'INR',
      receipt: `team_${teamId}_${Date.now()}`,
      notes: {
        team_id: teamId,
      },
    });

    // Store order in Firestore
    await db.collection('payment_orders').doc(order.id).set({
      orderId: order.id,
      teamId,
      amount: amount / 100, // Store in rupees
      status: 'created',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json(order);
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      error: 'Failed to create payment order'
    });
  }
});

// Verify payment
router.post('/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      teamId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !teamId) {
      res.status(400).json({
        error: 'Missing required payment verification parameters'
      });
      return;
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({
        error: 'Invalid payment signature'
      });
      return;
    }

    // Update payment order status
    await db.collection('payment_orders').doc(razorpay_order_id).update({
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: 'verified',
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update team payment status
    await db.collection('teams').doc(teamId).update({
      paymentStatus: 'paid',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      error: 'Failed to verify payment'
    });
  }
});

// Process refund
router.post('/refund', async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId, amount, teamId } = req.body;

    if (!paymentId || !amount || !teamId) {
      res.status(400).json({
        error: 'PaymentId, amount, and teamId are required'
      });
      return;
    }

    // Create refund
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100, // Convert to paise
      speed: 'normal',
      notes: {
        team_id: teamId,
        reason: 'Tournament cancellation/rejection',
      },
    });

    // Update team status
    await db.collection('teams').doc(teamId).update({
      paymentStatus: 'refunded',
      refundId: refund.id,
      refundedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Store refund record
    await db.collection('refunds').doc(refund.id).set({
      refundId: refund.id,
      paymentId,
      teamId,
      amount: amount,
      status: refund.status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      refund,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      error: 'Failed to process refund'
    });
  }
});

// Webhook handler for Razorpay events
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      res.status(400).json({
        error: 'Invalid webhook signature'
      });
      return;
    }

    const event = req.body;

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      case 'refund.processed':
        await handleRefundProcessed(event.payload.refund.entity);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({
      error: 'Failed to handle webhook'
    });
  }
});

// Helper functions
async function handlePaymentCaptured(payment: any) {
  try {
    // Update payment order status
    await db.collection('payment_orders').doc(payment.order_id).update({
      status: 'captured',
      capturedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('Payment captured:', payment.id);
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    // Update payment order status
    await db.collection('payment_orders').doc(payment.order_id).update({
      status: 'failed',
      failedAt: admin.firestore.FieldValue.serverTimestamp(),
      errorCode: payment.error_code,
      errorDescription: payment.error_description,
    });

    console.log('Payment failed:', payment.id);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleRefundProcessed(refund: any) {
  try {
    // Update refund status
    await db.collection('refunds').doc(refund.id).update({
      status: 'processed',
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('Refund processed:', refund.id);
  } catch (error) {
    console.error('Error handling refund processed:', error);
  }
}

export { router as paymentRoutes };
