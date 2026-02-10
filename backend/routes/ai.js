// AI Route - Generate Sleep Plan using Wavespeed AI
// ===================================================

const express = require('express');
const router = express.Router();
const sleepPlanGenerator = require('../services/sleepPlanGenerator');

// Generate personalized sleep plan
router.post('/generate-plan', async (req, res) => {
    try {
        const { quizData, paymentDetails } = req.body;

        // Validate input
        if (!quizData || !paymentDetails) {
            return res.status(400).json({ error: 'Missing quiz data or payment details' });
        }

        console.log('Generating sleep plan for:', quizData.babyAge);

        // Generate sleep plan using AI
        const plan = await sleepPlanGenerator.generatePlan(quizData);

        // Log successful generation
        console.log('Sleep plan generated successfully');

        res.json({
            success: true,
            plan: plan
        });

    } catch (error) {
        console.error('Error generating sleep plan:', error);
        res.status(500).json({
            error: 'Failed to generate sleep plan',
            message: error.message
        });
    }
});

module.exports = router;
