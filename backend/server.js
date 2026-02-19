// AI Baby Sleep Optimizer - Backend Server
// ==========================================

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

const aiRoutes = require('./routes/ai');
const emailRoutes = require('./routes/email');
const paystackRoutes = require('./routes/paystack');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'https://babysleepoptimizer.com',
        'https://www.babysleepoptimizer.com',
        'http://localhost:3000'
    ]
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api', aiRoutes);
app.use('/api', emailRoutes);
app.use('/api', paystackRoutes);

// Paystack Configuration Endpoint (serves public key to frontend)
app.get('/api/config/paystack', (req, res) => {
    const publicKey = process.env.PAYSTACK_PUBLIC_KEY;

    if (!publicKey) {
        console.error('⚠️  PAYSTACK_PUBLIC_KEY not configured in environment variables');
        return res.status(500).json({ error: 'Payment system not configured' });
    }

    res.json({
        publicKey,
        currency: 'USD'
    });
});

// PayPal Configuration Endpoint (for dynamic client ID loading)
app.get('/api/config/paypal', (req, res) => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const mode = process.env.PAYPAL_MODE || 'sandbox';

    if (!clientId) {
        console.error('⚠️  PAYPAL_CLIENT_ID not configured in environment variables');
        return res.status(500).json({ error: 'PayPal not configured' });
    }

    res.json({
        clientId,
        mode,
        currency: 'USD'
    });
});

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/quiz', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/quiz.html'));
});

app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/payment.html'));
});

app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/results.html'));
});

app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/faq.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/privacy.html'));
});

// Health check with service status
app.get('/health', (req, res) => {
    const sleepPlanGenerator = require('./services/sleepPlanGenerator');
    const stats = sleepPlanGenerator.getStats();

    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            api: 'operational',
            ai: {
                configured: stats.apiKeyConfigured,
                fallbackUsageCount: stats.fallbackUsageCount,
                status: stats.apiKeyConfigured ? 'configured' : 'using_fallback_only'
            },
            paystack: {
                configured: !!process.env.PAYSTACK_SECRET_KEY
            },
            paypal: {
                configured: !!process.env.PAYPAL_CLIENT_ID
            }
        },
        version: '2.0.0'
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Baby Sleep Optimizer server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`💳 Paystack: ${process.env.PAYSTACK_SECRET_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`💰 PayPal: ${process.env.PAYPAL_CLIENT_ID ? '✅ Configured' : '❌ Not configured'}`);
});

module.exports = app;
