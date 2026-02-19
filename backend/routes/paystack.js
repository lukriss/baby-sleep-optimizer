// Paystack Payment Routes
// ========================

const express = require('express');
const router = express.Router();
const axios = require('axios');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Initialize a Paystack transaction
router.post('/paystack/initialize', async (req, res) => {
    try {
        const { email, amount, metadata } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        if (!PAYSTACK_SECRET_KEY) {
            console.error('⚠️  PAYSTACK_SECRET_KEY not configured');
            return res.status(500).json({ error: 'Payment system not configured' });
        }

        const amountInCents = amount || 299;

        const response = await axios.post('https://api.paystack.co/transaction/initialize', {
            email: email,
            amount: amountInCents,
            currency: 'USD',
            metadata: metadata || {
                product: 'AI Baby Sleep Plan',
                type: 'one-time'
            },
            callback_url: `${process.env.DOMAIN || ''}/payment.html?verify=true`
        }, {
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.status) {
            res.json({
                success: true,
                authorization_url: response.data.data.authorization_url,
                access_code: response.data.data.access_code,
                reference: response.data.data.reference
            });
        } else {
            throw new Error('Failed to initialize transaction');
        }

    } catch (error) {
        console.error('Paystack initialization error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to initialize payment',
            message: error.response?.data?.message || error.message
        });
    }
});

// Verify a Paystack transaction
router.get('/paystack/verify/:reference', async (req, res) => {
    try {
        const { reference } = req.params;

        if (!reference) {
            return res.status(400).json({ error: 'Transaction reference is required' });
        }

        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
            }
        });

        const data = response.data.data;

        if (data.status === 'success') {
            console.log(`✅ Payment verified: ${reference} — ${data.customer.email} — ${data.currency} ${data.amount / 100}`);

            res.json({
                success: true,
                data: {
                    reference: data.reference,
                    amount: data.amount,
                    currency: data.currency,
                    email: data.customer.email,
                    status: data.status,
                    paid_at: data.paid_at
                }
            });
        } else {
            res.json({
                success: false,
                message: `Payment status: ${data.status}`
            });
        }

    } catch (error) {
        console.error('Paystack verification error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to verify payment',
            message: error.response?.data?.message || error.message
        });
    }
});

// Paystack Webhook
router.post('/paystack/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    try {
        const crypto = require('crypto');
        const hash = crypto
            .createHmac('sha512', PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash === req.headers['x-paystack-signature']) {
            const event = req.body;
            console.log('📩 Paystack webhook:', event.event);

            if (event.event === 'charge.success') {
                console.log(`💰 Payment confirmed via webhook: ${event.data.reference}`);
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(200);
    }
});

module.exports = router;
