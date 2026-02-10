// AI Baby Sleep Optimizer - Backend Server
// ==========================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const aiRoutes = require('./routes/ai');
const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api', aiRoutes);
app.use('/api', emailRoutes);

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

// Health check with AI service status
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
            }
        },
        version: '1.0.0'
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
});

module.exports = app;
