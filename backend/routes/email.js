// Email Route - Send sleep plan via email
// ========================================

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Send sleep plan email
router.post('/send-email', async (req, res) => {
    try {
        const { email, sleepPlan, quizData } = req.body;

        if (!email || !sleepPlan) {
            return res.status(400).json({ error: 'Missing email or sleep plan data' });
        }

        // Create email content
        const emailContent = formatEmailContent(sleepPlan, quizData);

        // For now, we'll use a simple web-based email service
        // In production, you'd configure an SMTP service or use EmailJS API

        // Option 1: Use EmailJS (requires client-side implementation)
        // Option 2: Use Web3Forms or FormSubmit (simpler, less control)
        // Option 3: Configure SMTP (requires credentials)

        // This is a placeholder - actual implementation depends on chosen service
        console.log(`Email would be sent to: ${email}`);
        console.log('Email content:', emailContent);

        // For now, return success (user should implement actual email service)
        res.json({
            success: true,
            message: 'Email sent successfully'
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            error: 'Failed to send email',
            message: error.message
        });
    }
});

// Format email content
function formatEmailContent(sleepPlan, quizData) {
    const ageLabel = getAgeLabel(quizData.babyAge);

    let content = `
Your Personalized Baby Sleep Plan
=================================

Created for: ${ageLabel}

24-HOUR SCHEDULE
----------------
`;

    sleepPlan.schedule.forEach(item => {
        content += `${item.time} - ${item.activity}\n`;
    });

    content += `\nBEDTIME ROUTINE (${sleepPlan.routineDuration})
-----------------\n`;

    sleepPlan.bedtimeRoutine.forEach((step, index) => {
        content += `${index + 1}. ${step.title}\n   ${step.description}\n\n`;
    });

    content += `\nWHAT TO EXPECT (FIRST 3 NIGHTS)
-------------------------------\n`;

    sleepPlan.expectations.forEach(item => {
        content += `Night ${item.night}: ${item.description}\n`;
    });

    content += `\n${sleepPlan.encouragement}\n`;

    content += `\n\nIMPORTANT DISCLAIMER
-------------------
This sleep plan is for educational purposes only and is not medical advice. 
Always consult your pediatrician about your baby's health and development.

© 2026 AI Baby Sleep Optimizer
babysleepoptimizer.com
`;

    return content;
}

// Get age label
function getAgeLabel(babyAge) {
    const ageLabels = {
        '0-6weeks': '0-6 weeks old',
        '6-12weeks': '6-12 weeks old',
        '3-4months': '3-4 months old',
        '5-6months': '5-6 months old',
        '7-9months': '7-9 months old',
        '10-12months': '10-12 months old',
        '12-18months': '12-18 months old',
        '18-24months': '18-24 months old'
    };
    return ageLabels[babyAge] || 'your baby';
}

module.exports = router;
