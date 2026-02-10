// PayPal Payment Integration
// ==========================

document.addEventListener('DOMContentLoaded', function () {
    // Check if quiz data exists
    const quizData = localStorage.getItem('quizData');
    if (!quizData) {
        alert('Please complete the quiz first');
        window.location.href = 'quiz.html';
        return;
    }

    // Initialize PayPal buttons
    initializePayPal();
});

function initializePayPal() {
    // Render PayPal buttons
    paypal.Buttons({
        style: {
            shape: 'pill',
            color: 'blue',
            layout: 'vertical',
            label: 'pay'
        },

        // Create order
        createOrder: function (data, actions) {
            return actions.order.create({
                purchase_units: [{
                    description: 'AI Baby Sleep Schedule - Personalized Plan',
                    amount: {
                        currency_code: 'USD',
                        value: '2.99'
                    }
                }],
                application_context: {
                    shipping_preference: 'NO_SHIPPING' // No address needed
                }
            });
        },

        // On approval
        onApprove: function (data, actions) {
            // Show loading state
            document.getElementById('paypal-button-container').classList.add('hidden');
            document.getElementById('payment-loading').classList.remove('hidden');

            return actions.order.capture().then(function (details) {
                console.log('Payment successful:', details);

                // Save payment info
                localStorage.setItem('paymentDetails', JSON.stringify({
                    orderId: data.orderID,
                    payerId: data.payerID,
                    payerEmail: details.payer.email_address,
                    payerName: details.payer.name.given_name + ' ' + details.payer.name.surname,
                    timestamp: new Date().toISOString()
                }));

                // Generate sleep plan
                generateSleepPlan();
            });
        },

        // On error
        onError: function (err) {
            console.error('Payment error:', err);
            document.getElementById('payment-loading').classList.add('hidden');
            document.getElementById('payment-error').classList.remove('hidden');

            // Re-show PayPal buttons after 3 seconds
            setTimeout(() => {
                document.getElementById('payment-error').classList.add('hidden');
                document.getElementById('paypal-button-container').classList.remove('hidden');
            }, 3000);
        },

        // On cancel
        onCancel: function (data) {
            console.log('Payment cancelled');
            // User can try again - buttons remain visible
        }

    }).render('#paypal-button-container');
}

// Generate sleep plan via API
async function generateSleepPlan() {
    try {
        const quizData = JSON.parse(localStorage.getItem('quizData'));
        const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails'));

        // Call backend API to generate plan
        const response = await fetch('https://baby-sleep-optimizer-production.up.railway.app/api/generate-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quizData,
                paymentDetails
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate sleep plan');
        }

        const result = await response.json();

        // Save sleep plan
        localStorage.setItem('sleepPlan', JSON.stringify(result.plan));

        // Redirect to results page
        window.location.href = 'results.html';

    } catch (error) {
        console.error('Error generating sleep plan:', error);

        // Hide loading, show error
        document.getElementById('payment-loading').classList.add('hidden');
        document.getElementById('payment-error').classList.remove('hidden');
        document.getElementById('payment-error').querySelector('p').textContent =
            'Payment successful but we encountered an error generating your plan. Please contact support with your order ID.';
    }
}
