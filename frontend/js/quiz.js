// Quiz Navigation and Data Management
// =====================================

const totalSteps = 8;
let currentStep = 1;
const quizData = {};

// Initialize quiz
document.addEventListener('DOMContentLoaded', function () {
    // Check if we have saved quiz data
    const saved = localStorage.getItem('quizData');
    if (saved) {
        Object.assign(quizData, JSON.parse(saved));
        populateFormFields();
    }

    // Show first step
    showStep(1);

    // Add radio button click handlers
    setupRadioListeners();
});

// Setup radio button visual feedback
function setupRadioListeners() {
    const radioOptions = document.querySelectorAll('.radio-option');
    radioOptions.forEach(option => {
        const radio = option.querySelector('input[type="radio"]');

        option.addEventListener('click', function () {
            // Remove selected class from siblings
            const siblings = this.parentElement.querySelectorAll('.radio-option');
            siblings.forEach(sib => sib.classList.remove('selected'));

            // Add selected class to this option
            this.classList.add('selected');

            // Check the radio
            radio.checked = true;
        });
    });
}

// Show specific step
function showStep(step) {
    // Hide all steps
    const steps = document.querySelectorAll('.quiz-step');
    steps.forEach(s => s.classList.remove('active'));

    // Show current step
    const currentStepEl = document.querySelector(`[data-step="${step}"]`);
    if (currentStepEl) {
        currentStepEl.classList.add('active');
        currentStepEl.style.display = 'block';
    }

    // Update progress
    updateProgress(step);

    // Update current step tracker
    currentStep = step;
}

// Update progress bar
function updateProgress(step) {
    const percentage = (step / totalSteps) * 100;
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }

    if (progressText) {
        progressText.textContent = `Step ${step} of ${totalSteps}`;
    }
}

// Validate current step
function validateStep(step) {
    const stepEl = document.querySelector(`[data-step="${step}"]`);
    if (!stepEl) return false;

    // Step 1: Baby Age (select dropdown)
    if (step === 1) {
        const ageSelect = document.getElementById('babyAge');
        if (!ageSelect || !ageSelect.value) {
            alert('Please select your baby\'s age');
            return false;
        }
        quizData.babyAge = ageSelect.value;
    }

    // Steps 2-8: Radio buttons
    else {
        const radioName = getRadioNameForStep(step);
        const selected = stepEl.querySelector(`input[name="${radioName}"]:checked`);

        if (!selected) {
            alert('Please select an option');
            return false;
        }

        quizData[radioName] = selected.value;
    }

    // Save to localStorage
    localStorage.setItem('quizData', JSON.stringify(quizData));

    return true;
}

// Get radio button name for each step
function getRadioNameForStep(step) {
    const names = {
        2: 'feedingMethod',
        3: 'nightSleep',
        4: 'napPattern',
        5: 'bedtimeRoutine',
        6: 'sleepEnvironment',
        7: 'parentingStyle',
        8: 'primaryStruggle'
    };
    return names[step];
}

// Next step navigation
function nextStep(step) {
    if (!validateStep(step)) {
        return;
    }

    if (step < totalSteps) {
        showStep(step + 1);
    }
}

// Previous step navigation
function prevStep(step) {
    if (step > 1) {
        showStep(step - 1);
    }
}

// Go to payment page
function goToPayment() {
    if (!validateStep(8)) {
        return;
    }

    // Save complete quiz data
    localStorage.setItem('quizData', JSON.stringify(quizData));

    // Redirect to payment
    window.location.href = 'payment.html';
}

// Populate form fields from saved data
function populateFormFields() {
    // Age dropdown
    if (quizData.babyAge) {
        const ageSelect = document.getElementById('babyAge');
        if (ageSelect) {
            ageSelect.value = quizData.babyAge;
        }
    }

    // Radio buttons
    Object.keys(quizData).forEach(key => {
        if (key !== 'babyAge') {
            const radio = document.querySelector(`input[name="${key}"][value="${quizData[key]}"]`);
            if (radio) {
                radio.checked = true;
                const option = radio.closest('.radio-option');
                if (option) {
                    option.classList.add('selected');
                }
            }
        }
    });
}

// Keyboard navigation
document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const activeStep = document.querySelector('.quiz-step.active');
        if (activeStep) {
            const stepNumber = parseInt(activeStep.getAttribute('data-step'));
            if (stepNumber < totalSteps) {
                nextStep(stepNumber);
            } else {
                goToPayment();
            }
        }
    }
});
