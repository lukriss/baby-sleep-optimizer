// Email Route — Send sleep plan summary to customer
// ==================================================
// Uses nodemailer with Gmail SMTP (or any SMTP via env vars)
// Required env vars:
//   EMAIL_USER     — Gmail address (e.g. hello@babysleepoptimizer.com)
//   EMAIL_PASS     — Gmail App Password (generate at myaccount.google.com/apppasswords)
//   NOTIFICATION_EMAIL — your email (receives BCC/copy of every plan sent)

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

function createTransport() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

// POST /api/send-plan-email
// Body: { email, babyName, plan, quizData, planTier }
router.post('/send-plan-email', async (req, res) => {
    try {
        const { email, babyName, plan, quizData, planTier } = req.body;

        if (!email || !plan) {
            return res.status(400).json({ error: 'Missing email or plan data' });
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('⚠️  EMAIL_USER / EMAIL_PASS not set — email not sent');
            return res.json({ success: true, message: 'Email skipped (not configured)' });
        }

        const name = babyName || 'your baby';
        const nameCap = name.charAt(0).toUpperCase() + name.slice(1);
        const tierLabel = { starter: 'Starter', complete: 'Complete', premium: 'Premium' }[planTier] || 'Sleep';
        const ageLabel = getAgeLabel(quizData?.babyAge);
        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const planUrl = 'https://babysleepoptimizer.com/success.html';

        const scheduleRows = (plan.schedule || []).slice(0, 8).map(s =>
            `<tr>
                <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:0.82rem;color:#5b4fcf;font-weight:600;white-space:nowrap;">${s.time.split('—')[0].trim()}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:0.82rem;font-weight:600;">${s.label}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:0.78rem;color:#718096;">${(s.detail||'').substring(0, 80)}${(s.detail||'').length > 80 ? '…' : ''}</td>
            </tr>`
        ).join('');

        const routineRows = (plan.bedtimeRoutine || []).map((s, i) =>
            `<tr>
                <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">
                    <span style="display:inline-block;width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#5b4fcf,#7c6fe0);color:white;font-weight:700;font-size:0.8rem;line-height:26px;text-align:center;">${i + 1}</span>
                </td>
                <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:0.83rem;font-weight:600;">${s.title}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:0.78rem;color:#718096;">${s.time || ''}</td>
            </tr>`
        ).join('');

        const tags = (plan.babyTags || []).map(t =>
            `<span style="display:inline-block;background:#f0edff;color:#5b4fcf;padding:3px 10px;border-radius:100px;font-size:0.72rem;font-weight:600;margin:2px;">${t}</span>`
        ).join('');

        const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Your Sleep Plan</title></head>
<body style="margin:0;padding:0;background:#f7f8fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fc;padding:30px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#5b4fcf,#7c6fe0);border-radius:16px 16px 0 0;padding:30px 35px;text-align:center;">
    <div style="font-size:1.4rem;font-weight:700;color:white;margin-bottom:6px;">🌙 Baby<span style="color:#fbd38d;">Sleep</span>Optimizer</div>
    <div style="display:inline-block;background:rgba(255,255,255,0.2);padding:4px 14px;border-radius:100px;font-size:0.72rem;font-weight:700;color:white;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">${tierLabel} Plan</div>
    <h1 style="color:white;font-size:1.5rem;margin:0 0 6px;">${nameCap}'s Sleep Plan is Ready! 🎉</h1>
    <p style="color:rgba(255,255,255,0.88);font-size:0.9rem;margin:0;">Personalised for ${ageLabel} • Generated ${today}</p>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:white;padding:30px 35px;">

    <!-- Tags -->
    <div style="margin-bottom:20px;">${tags}</div>

    <!-- Score -->
    ${plan.sleepScore ? `
    <div style="background:#f7f8fc;border-radius:12px;padding:16px 18px;margin-bottom:20px;display:flex;align-items:center;gap:16px;">
        <div style="font-size:1.8rem;font-weight:800;color:#5b4fcf;min-width:50px;">${plan.sleepScore}<span style="font-size:0.8rem;color:#a0aec0;">/100</span></div>
        <div>
            <div style="font-weight:700;color:#1a202c;margin-bottom:3px;">${plan.sleepScoreLabel || 'Sleep Score'}</div>
            <div style="font-size:0.83rem;color:#718096;">${plan.sleepScoreNote || ''}</div>
        </div>
    </div>` : ''}

    <!-- Tonight's focus -->
    ${plan.tonightsFocus ? `
    <div style="background:#fffff0;border:1px solid #fefcbf;border-left:4px solid #ecc94b;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
        <div style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#975a16;margin-bottom:4px;">🎯 Tonight's Focus</div>
        <div style="font-size:0.87rem;color:#744210;font-weight:500;">${plan.tonightsFocus}</div>
    </div>` : ''}

    <!-- Schedule -->
    <h2 style="font-size:1rem;color:#1a202c;margin:0 0 12px;">📋 ${nameCap}'s Daily Schedule</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #edf2f7;border-radius:10px;overflow:hidden;margin-bottom:24px;">
        <tbody>${scheduleRows}</tbody>
    </table>

    <!-- Bedtime Routine -->
    <h2 style="font-size:1rem;color:#1a202c;margin:0 0 12px;">🌙 Bedtime Routine</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #edf2f7;border-radius:10px;overflow:hidden;margin-bottom:28px;">
        <tbody>${routineRows}</tbody>
    </table>

    <!-- CTA -->
    <div style="text-align:center;background:linear-gradient(135deg,#faf5ff,#f0edff);border-radius:14px;padding:24px;margin-bottom:20px;">
        <p style="font-size:0.92rem;color:#553c9a;margin:0 0 14px;">Your full interactive plan (with all sections) is available online:</p>
        <a href="${planUrl}" style="display:inline-block;background:#5b4fcf;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:0.95rem;">View Full Plan Online →</a>
        <p style="font-size:0.78rem;color:#a0aec0;margin:12px 0 0;">You can also print or save as PDF from the plan page</p>
    </div>

    <p style="font-size:0.78rem;color:#a0aec0;text-align:center;margin:0;">
        BabySleepOptimizer.com • Not medical advice. Always consult your paediatrician.<br>
        © ${new Date().getFullYear()} BabySleepOptimizer
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

        const transporter = createTransport();

        await transporter.sendMail({
            from: `"BabySleepOptimizer" <${process.env.EMAIL_USER}>`,
            to: email,
            bcc: process.env.NOTIFICATION_EMAIL || '',
            subject: `🌙 ${nameCap}'s Personalised Sleep Plan is Ready!`,
            html: htmlBody
        });

        console.log(`✅ Plan email sent to ${email}`);
        res.json({ success: true, message: 'Plan emailed successfully' });

    } catch (error) {
        console.error('Email send error:', error.message);
        res.status(500).json({ error: 'Failed to send email', message: error.message });
    }
});

function getAgeLabel(a) {
    return { '0-6weeks':'0-6 weeks old','6-12weeks':'6-12 weeks old','3-4months':'3-4 months old',
        '5-6months':'5-6 months old','7-9months':'7-9 months old','10-12months':'10-12 months old',
        '12-18months':'12-18 months old','18-24months':'18-24 months old' }[a] || 'your baby';
}

module.exports = router;
