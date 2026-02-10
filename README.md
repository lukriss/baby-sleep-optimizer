# 👶💤 AI Baby Sleep Optimizer

Get personalized baby sleep schedules powered by AI. A complete, production-ready web application designed for exhausted parents seeking gentle sleep solutions.

## 🌟 Features

- **8-Step Interactive Quiz** - Progressive disclosure for easy completion
- **AI-Powered Personalization** - Wavespeed AI generates custom sleep plans
- **PayPal Payment Integration** - Secure $2.99 one-time payment
- **PDF Download** - Printable sleep plan with professional formatting
- **Email Delivery** - Optional email delivery of sleep plan
- **Mobile-First Design** - Optimized for smartphone use at 3 AM
- **Conversion-Optimized** - Emotional copy, trust indicators, social proof

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (mobile-first)
- **Backend:** Node.js + Express
- **AI:** Wavespeed AI API
- **Payment:** PayPal Smart Payment Buttons
- **PDF:** jsPDF library
- **Deployment:** Docker-ready

## 📋 Prerequisites

Before running this application, you'll need:

1. **Node.js** (v16 or higher)
2. **Wavespeed AI API key** (already configured: `e9b19fe8...`)
3. **PayPal Developer Account** 
   - Create one at: https://developer.paypal.com/
   - Get Client ID and Secret from Dashboard
4. **(Optional) Email Service**
   - EmailJS (recommended, 200 emails/month free)
   - Or configure SMTP credentials

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd baby-sleep-optimizer/backend
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file:

```env
# Required: Add your PayPal credentials
PAYPAL_CLIENT_ID=your_actual_client_id_here
PAYPAL_CLIENT_SECRET=your_actual_secret_here
PAYPAL_MODE=sandbox  # or 'live' for production

# Optional: Email service credentials
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_USER_ID=your_emailjs_user_id
```

### 3. Update PayPal Client ID in Frontend

Edit `frontend/payment.html` line 94:

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_ACTUAL_CLIENT_ID&currency=USD"></script>
```

Replace `YOUR_ACTUAL_CLIENT_ID` with your PayPal Client ID.

### 4. Start the Server

```bash
cd backend
npm start
```

The app will be running at: **http://localhost:3000**

### 5. Test the Application

1. Open http://localhost:3000 in your browser
2. Click "Get Your Sleep Plan Now"
3. Complete the quiz (all 8 steps)
4. Use PayPal Sandbox for testing:
   - Test buyer account (create at PayPal Developer Dashboard)
   - Or use your personal PayPal in sandbox mode

## 🔧 Development Mode

For auto-reload during development:

```bash
npm install -D nodemon  # If not already installed
npm run dev
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t baby-sleep-optimizer .
```

### Run Container

```bash
docker run -p 3000:3000 --env-file .env baby-sleep-optimizer
```

Access at: **http://localhost:3000**

## 🌐 Production Deployment

### Option 1: VPS (DigitalOcean, Linode, AWS)

1. **Upload files** to your server
2. **Install Node.js** on server
3. **Configure environment variables:**
   ```bash
   nano .env
   # Update PAYPAL_MODE=live
   # Update DOMAIN=https://yourdomain.com
   ```
4. **Install dependencies:**
   ```bash
   cd backend && npm install --production
   ```
5. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name baby-sleep-optimizer
   pm2 save
   pm2 startup
   ```
6. **Configure Nginx reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name babysleepoptimizer.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
7. **Get SSL certificate:**
   ```bash
   sudo certbot --nginx -d babysleepoptimizer.com
   ```

### Option 2: Shared Hosting (with Node.js support)

1. Upload files via FTP/SFTP
2. Use hosting control panel to:
   - Set Node.js version (16+)
   - Configure environment variables
   - Set startup file to `backend/server.js`
   - Set port (usually provided by host)

### Option 3: Platform-as-a-Service

**Heroku:**
```bash
heroku create baby-sleep-optimizer
heroku config:set WAVESPEED_API_KEY=your_key
heroku config:set PAYPAL_CLIENT_ID=your_id
git push heroku main
```

**Render, Railway, Fly.io:** Follow similar deployment patterns

## 📧 Email Service Setup

### Option 1: EmailJS (Recommended - Free)

1. Create account at https://www.emailjs.com/
2. Create email service (Gmail, Outlook, etc.)
3. Create email template
4. Get Service ID, Template ID, and User ID
5. Add to `.env` file

### Option 2: Gmail SMTP

```env
EMAIL_SERVICE=gmail
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=your_app_specific_password
```

**Note:** Enable "Less secure app access" or use App Password

## 🔒 Security Checklist

Before going live:

- [ ] Change `PAYPAL_MODE=live` in `.env`
- [ ] Use real PayPal Client ID (not sandbox)
- [ ] Add `.env` to `.gitignore` (never commit secrets)
- [ ] Enable HTTPS/SSL certificate
- [ ] Set CORS to specific domain (not `*`)
- [ ] Implement rate limiting on API endpoints
- [ ] Add CAPTCHA to prevent spam (optional)

## 📊 Monitoring & Analytics

Add Google Analytics to track conversions:

1. Get GA4 tracking ID
2. Add to `frontend/index.html` `<head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 💰 Payment Testing

### PayPal Sandbox Testing

1. Go to https://developer.paypal.com/dashboard/
2. Create test buyer account
3. Use test credentials to complete purchase
4. Check transactions in PayPal sandbox

### Going Live

1. Update `.env`: `PAYPAL_MODE=live`
2. Update `frontend/payment.html` with live Client ID
3. Test with small real payment
4. Monitor PayPal dashboard for transactions

## 🐛 Troubleshooting

**"Payment failed"**
- Check PayPal Client ID is correct in both `.env` and `payment.html`
- Ensure PayPal mode matches (sandbox vs live)
- Check browser console for errors

**"Failed to generate sleep plan"**
- Verify Wavespeed API key is valid
- Check server logs for AI API errors
- Fallback plan should still generate

**Email not sending**
- Verify email service credentials
- Check spam folder
- Console shows "Email would be sent" - implement actual email service

## 📝 License

Proprietary - All Rights Reserved

## 🆘 Support

For issues or questions:
- Email: support@babysleepoptimizer.com
- Check server logs: `pm2 logs baby-sleep-optimizer`

## 🎯 Next Steps

1. **Get PayPal credentials** from developer.paypal.com
2. **Test complete purchase flow** in sandbox mode
3. **Set up email service** (EmailJS recommended)
4. **Deploy to production** server
5. **Configure domain** (babysleepoptimizer.com)
6. **Add SSL certificate**
7. **Test live payment**
8. **Launch! 🚀**

---

Built with ❤️ for exhausted parents everywhere 👶💤
