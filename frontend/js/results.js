// Results Page - Premium Sleep Plan Display
// ===========================================

let sleepPlan = null;
let paymentDetails = null;

document.addEventListener('DOMContentLoaded', async function () {
    // Check if user has completed payment
    paymentDetails = JSON.parse(localStorage.getItem('paymentDetails'));

    if (!paymentDetails) {
        alert('Please complete payment first');
        window.location.href = 'quiz.html';
        return;
    }

    // Check if sleep plan already exists
    const cachedPlan = localStorage.getItem('sleepPlan');

    if (cachedPlan) {
        sleepPlan = JSON.parse(cachedPlan);
        // Check for new version fields (e.g. 'education' section)
        if (!sleepPlan.education) {
            console.log("Old plan detected, refreshing...");
            await fetchSleepPlan();
        } else {
            displaySleepPlan();
        }
    } else {
        await fetchSleepPlan();
    }
});

// Fetch sleep plan from backend
async function fetchSleepPlan() {
    try {
        const quizData = JSON.parse(localStorage.getItem('quizData'));

        // Show loading state
        document.getElementById('loading-plan').classList.remove('hidden');
        document.getElementById('sleep-plan-content').classList.add('hidden');

        const response = await fetch('/api/generate-plan', {
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
            throw new Error('Failed to fetch sleep plan');
        }

        const result = await response.json();
        sleepPlan = result.plan;

        // Cache the plan
        localStorage.setItem('sleepPlan', JSON.stringify(sleepPlan));

        displaySleepPlan();

    } catch (error) {
        console.error('Error fetching sleep plan:', error);
        document.getElementById('loading-plan').innerHTML = `
            <div class="alert alert-warning">
                <p>Error generating your detailed plan. Please try refreshing the page.</p>
                <button onclick="location.reload()" class="btn btn-primary mt-3">Try Again</button>
            </div>
        `;
    }
}

// Display sleep plan on page
function displaySleepPlan() {
    // Hide loading
    document.getElementById('loading-plan').classList.add('hidden');
    document.getElementById('sleep-plan-content').classList.remove('hidden');

    const planDisplay = document.getElementById('plan-display');

    // Helper for sections
    const renderSection = (title, content) => {
        if (!content) return '';
        return `
            <div class="plan-section mb-5">
                <h3 class="section-title text-primary mb-3">${title}</h3>
                <div class="section-content text-dark">
                    ${content}
                </div>
            </div>
        `;
    };

    planDisplay.innerHTML = `
        <div class="card-header text-center mb-5">
            <h2 class="display-4 text-primary">Your Premium Sleep Guide</h2>
            <p class="text-muted">Personalized for ${getAgeLabel()} • ${getParentingStyleLabel()}</p>
        </div>

        <div class="card-body">
            <!-- 1. Reassurance / Letter -->
            ${sleepPlan.letter ? `
                <div class="alert alert-secondary mb-5 p-4" style="background-color: #f8f9fa; border-left: 5px solid #6c757d;">
                    <h4 class="mb-3">💌 A Note for You</h4>
                    <div style="white-space: pre-line; line-height: 1.6;">${sleepPlan.letter}</div>
                </div>
            ` : ''}

            <!-- 2. Education -->
            ${renderSection('🧠 Understanding Your Baby\'s Sleep', `<p style="white-space: pre-line;">${sleepPlan.education || ''}</p>`)}

            <!-- 3. Schedule -->
            <div class="plan-section mb-5">
                <h3 class="section-title text-primary mb-3">📅 Optimized 24-Hour Schedule</h3>
                <div class="timeline mb-4">
                    ${sleepPlan.schedule.map(item => `
                        <div class="timeline-item">
                            <div class="timeline-time font-weight-bold">${item.time}</div>
                            <div class="timeline-content">${item.activity}</div>
                        </div>
                    `).join('')}
                </div>
                ${sleepPlan.scheduleNote ? `<div class="alert alert-info"><p><strong>💡 Schedule Note:</strong> ${sleepPlan.scheduleNote}</p></div>` : ''}
            </div>

            <!-- 4. Bedtime Routine -->
            <div class="plan-section mb-5">
                <h3 class="section-title text-primary mb-3">🌙 Bedtime Routine Strategy</h3>
                <div class="mb-4">
                    ${sleepPlan.bedtimeRoutine?.steps ? sleepPlan.bedtimeRoutine.steps.map((step, index) => `
                        <div class="d-flex mb-3 align-items-start">
                            <div class="badge badge-primary rounded-circle mr-3 p-2" style="min-width: 30px; text-align: center;">${index + 1}</div>
                            <div>
                                <strong>${step.title}</strong>
                                <p class="text-muted mb-0 small">${step.explanation || ''}</p>
                            </div>
                        </div>
                    `).join('') : ''}
                </div>
                ${sleepPlan.bedtimeRoutine?.variations ? `
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <div class="card bg-light p-3 h-100">
                                <h5>🧘‍♂️ Calm Night Variation</h5>
                                <p class="small mb-0">${sleepPlan.bedtimeRoutine.variations.calm}</p>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="card bg-light p-3 h-100">
                                <h5>😫 Overtired / Meltdown</h5>
                                <p class="small mb-0">${sleepPlan.bedtimeRoutine.variations.overtired}</p>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>

            <!-- 5. Sleep Training -->
            ${sleepPlan.sleepTraining ? renderSection('🛡️ Your Sleep Approach', `
                <div class="p-3 mb-3 bg-white border rounded">
                    <strong>Method: ${sleepPlan.sleepTraining.method}</strong>
                    <div class="mt-2" style="white-space: pre-line;">${sleepPlan.sleepTraining.guide}</div>
                </div>
            `) : ''}

            <!-- 6. Feeding -->
            ${renderSection('🍼 Feeding & Sleep Connection', `<p style="white-space: pre-line;">${sleepPlan.feeding || ''}</p>`)}

            <!-- 7. Expectations -->
             <div class="plan-section mb-5">
                <h3 class="section-title text-primary mb-3">📈 What to Expect: The First Week</h3>
                ${sleepPlan.expectations ? sleepPlan.expectations.map(exp => `
                    <div class="mb-3 p-3 border-left">
                        <h5 class="text-secondary">${exp.day}</h5>
                        <p class="mb-0">${exp.description}</p>
                    </div>
                `).join('') : ''}
            </div>

            <!-- 8. Troubleshooting -->
            ${sleepPlan.troubleshooting ? `
                <div class="plan-section mb-5">
                    <h3 class="section-title text-primary mb-3">🔧 Troubleshooting Guide</h3>
                    ${sleepPlan.troubleshooting.map(issue => `
                        <div class="mb-3">
                            <strong>❓ ${issue.problem}</strong>
                            <p class="pl-3 border-left ml-1 mt-1 text-muted">${issue.solution}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

             <!-- 9. Optimization -->
            ${sleepPlan.optimization ? renderSection('✨ Optimization Tips', `
                <ul>
                    ${sleepPlan.optimization.map(tip => `<li class="mb-2">${tip}</li>`).join('')}
                </ul>
            `) : ''}

            <!-- 10. Encouragement -->
             ${renderSection('💙 Final Thoughts', `<p class="lead" style="white-space: pre-line;">${sleepPlan.encouragement || ''}</p>`)}
        </div>
    `;
}

// Get age label from quiz data
function getAgeLabel() {
    const quizData = JSON.parse(localStorage.getItem('quizData'));
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
    return ageLabels[quizData.babyAge] || 'your baby';
}

// Get parenting style label
function getParentingStyleLabel() {
    const quizData = JSON.parse(localStorage.getItem('quizData'));
    const styleLabels = {
        'gentle': 'Gentle/No cry',
        'moderate': 'Moderate approach',
        'cio': 'Cry-it-out method',
        'unsure': 'Flexible approach'
    };
    return styleLabels[quizData.parentingStyle] || 'Personalized approach';
}

// Download PDF - Premium Guidebook Format (Super Robust Version)
function downloadPDF() {
    console.log("Starting PDF generation...");

    // Robust jsPDF detection
    let jsPDF = null;
    if (window.jspdf && window.jspdf.jsPDF) {
        jsPDF = window.jspdf.jsPDF;
    } else if (window.jsPDF) {
        jsPDF = window.jsPDF;
    }

    if (!jsPDF) {
        console.error("jspdf library not found");
        alert("PDF generator library not loaded. Please refresh the page.");
        return;
    }

    try {
        const doc = new jsPDF();
        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = width - (margin * 2);

        // Colors
        const primaryColor = [107, 155, 209]; // #6B9BD1
        const secondaryColor = [244, 228, 215]; // #F4E4D7
        const textColor = [45, 52, 54]; // #2D3436
        const lightText = [100, 100, 100];

        // Safe helpers
        const safeStr = (str) => (str === null || str === undefined) ? '' : String(str);

        // Helper: Add decorative background
        function addPageDecor() {
            try {
                doc.setFillColor(250, 249, 247);
                doc.rect(0, 0, width, height, 'F');
                doc.setFillColor(...primaryColor);
                doc.rect(0, 0, width, 5, 'F');
                doc.setFontSize(8);
                doc.setTextColor(...lightText);
                doc.text('AI Baby Sleep Optimizer • Personalized Premium Guide', width / 2, height - 10, { align: 'center' });
            } catch (e) { console.error("Decor error", e); }
        }

        // Helper: Check for new page
        let yPos = 0;
        function checkPage(neededSpace) {
            if (yPos + neededSpace > height - margin) {
                doc.addPage();
                addPageDecor();
                yPos = margin + 10;
                return true;
            }
            return false;
        }

        // Helper: Add Section Title
        function addSectionTitle(title) {
            checkPage(30);
            doc.setFontSize(18);
            doc.setTextColor(...primaryColor);
            doc.setFont(undefined, 'bold');
            doc.text(safeStr(title), margin, yPos);
            yPos += 12;
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, yPos, width - margin, yPos);
            yPos += 10;
        }

        // Helper: Add Paragraph text (Strictly Typesafe)
        function addParagraph(text, fontSize = 11, fontStyle = 'normal') {
            const str = safeStr(text);
            if (!str) return;

            doc.setFontSize(fontSize);
            doc.setTextColor(...textColor);
            doc.setFont(undefined, fontStyle);

            // splitTextToSize creates an array of strings that fit width
            const lines = doc.splitTextToSize(str, contentWidth);

            // Check if page break needed based on number of lines
            // 5 is rough line height estimate for size 11
            const neededHeight = (lines.length * 5) + 5;
            checkPage(neededHeight);

            // Standard text call with array of lines
            doc.text(lines, margin, yPos);
            yPos += neededHeight + 3;
        }

        // === PAGE 1: COVER ===
        addPageDecor();
        yPos = 60;

        // Cover Content
        doc.setFillColor(...primaryColor);
        doc.circle(width / 2, yPos, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('S', width / 2, yPos + 8, { align: 'center' });
        yPos += 40;

        doc.setTextColor(...textColor);
        doc.setFontSize(32);
        doc.setFont(undefined, 'bold');
        doc.text('Your Baby\'s Sleep Guide', width / 2, yPos, { align: 'center' });
        yPos += 15;

        doc.setFontSize(16);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...lightText);
        doc.text(`Personalized for ${safeStr(getAgeLabel())}`, width / 2, yPos, { align: 'center' });
        yPos += 30;

        // 1. Letter
        if (sleepPlan?.letter) {
            const letterText = safeStr(sleepPlan.letter);
            doc.setFontSize(11);
            doc.setFont(undefined, 'italic');
            const letterLines = doc.splitTextToSize(letterText, contentWidth - 20);
            const boxHeight = letterLines.length * 5 + 20;

            doc.setFillColor(...secondaryColor);
            // Use standard rect instead of roundedRect for better compatibility
            doc.rect(margin, yPos, contentWidth, boxHeight, 'F');
            doc.setTextColor(...textColor);
            // Centered text needs array handling carefully or single string
            doc.text(letterLines, width / 2, yPos + 10, { align: 'center' });
            yPos += boxHeight + 20;
        }

        // === CONTENT ===

        // 2. Education
        doc.addPage();
        addPageDecor();
        yPos = margin + 10;
        if (sleepPlan?.education) {
            addSectionTitle('1. Understanding Sleep');
            addParagraph(sleepPlan.education);
        }

        // 3. Schedule
        if (Array.isArray(sleepPlan?.schedule)) {
            addSectionTitle('2. Optimized 24-Hour Schedule');
            doc.setFontSize(11);
            sleepPlan.schedule.forEach(item => {
                if (!item) return;
                checkPage(20); // Minimal space for time block

                doc.setFont(undefined, 'bold');
                doc.text(safeStr(item.time), margin, yPos);

                doc.setFont(undefined, 'normal');
                // Calculate activity lines manually to ensure correct yPos increment
                const actLines = doc.splitTextToSize(safeStr(item.activity), contentWidth - 30);
                doc.text(actLines, margin + 25, yPos);

                // Increment yPos based on activity length
                const height = Math.max(1, actLines.length) * 5 + 6;
                yPos += height;
            });
            if (sleepPlan.scheduleNote) {
                yPos += 5;
                doc.setFont(undefined, 'italic');
                addParagraph("Note: " + sleepPlan.scheduleNote);
            }
        }

        // 4. Bedtime Routine
        if (sleepPlan?.bedtimeRoutine) {
            addSectionTitle('3. Bedtime Routine Strategy');

            if (Array.isArray(sleepPlan.bedtimeRoutine.steps)) {
                sleepPlan.bedtimeRoutine.steps.forEach((step, i) => {
                    checkPage(15);
                    doc.setFont(undefined, 'bold');
                    doc.text(`${i + 1}. ${safeStr(step.title)}`, margin, yPos);
                    yPos += 5;
                    doc.setFont(undefined, 'normal');
                    addParagraph(step.explanation);
                });
            }

            if (sleepPlan.bedtimeRoutine.variations) {
                checkPage(40);
                yPos += 5;
                doc.setFont(undefined, 'bold');
                doc.text("Variations:", margin, yPos);
                yPos += 7;
                doc.setFont(undefined, 'normal');

                if (sleepPlan.bedtimeRoutine.variations.calm) {
                    const calmText = "- Calm Night: " + safeStr(sleepPlan.bedtimeRoutine.variations.calm);
                    // Use splitTextToSize instead of maxWidth option
                    const calmLines = doc.splitTextToSize(calmText, contentWidth - 5);
                    doc.text(calmLines, margin + 5, yPos);
                    yPos += calmLines.length * 5 + 5;
                }

                checkPage(30);
                yPos += 5;

                if (sleepPlan.bedtimeRoutine.variations.overtired) {
                    const overText = "- Overtired: " + safeStr(sleepPlan.bedtimeRoutine.variations.overtired);
                    const overLines = doc.splitTextToSize(overText, contentWidth - 5);
                    doc.text(overLines, margin + 5, yPos);
                    yPos += overLines.length * 5 + 10;
                }
            }
        }

        // 5. Sleep Training
        if (sleepPlan?.sleepTraining) {
            addSectionTitle('4. Your Sleep Approach');
            doc.setFont(undefined, 'bold');
            addParagraph(`Method: ${sleepPlan.sleepTraining.method}`);
            addParagraph(sleepPlan.sleepTraining.guide);
        }

        // 6. Feeding
        if (sleepPlan?.feeding) {
            addSectionTitle('5. Feeding & Sleep Connection');
            addParagraph(sleepPlan.feeding);
        }

        // 7. Expectations
        if (Array.isArray(sleepPlan?.expectations)) {
            addSectionTitle('6. What to Expect (First Week)');
            sleepPlan.expectations.forEach(item => {
                checkPage(30);
                doc.setFont(undefined, 'bold');
                doc.text(safeStr(item.day), margin, yPos);
                yPos += 5;
                addParagraph(item.description);
            });
        }

        // 8. Troubleshooting
        if (Array.isArray(sleepPlan?.troubleshooting)) {
            addSectionTitle('7. Troubleshooting Guide');
            sleepPlan.troubleshooting.forEach(item => {
                checkPage(30);
                doc.setFont(undefined, 'bold');
                doc.text("❓ " + safeStr(item.problem), margin, yPos);
                yPos += 6;
                addParagraph(item.solution);
            });
        }

        // 9. Optimization
        if (Array.isArray(sleepPlan?.optimization)) {
            addSectionTitle('8. Optimization Tips');
            sleepPlan.optimization.forEach(tip => {
                checkPage(15);
                const tipText = "• " + safeStr(tip);
                const tipLines = doc.splitTextToSize(tipText, contentWidth);
                doc.text(tipLines, margin, yPos);
                yPos += tipLines.length * 5 + 3;
            });
        }

        // 10. Encouragement
        if (sleepPlan?.encouragement) {
            checkPage(50);
            yPos += 10;
            doc.setFillColor(...secondaryColor);
            doc.roundedRect(margin, yPos, contentWidth, 40, 5, 'F');

            doc.setFontSize(12);
            doc.setTextColor(...textColor);
            doc.setFont(undefined, 'italic');
            const encLines = doc.splitTextToSize(safeStr(sleepPlan.encouragement), contentWidth - 20);
            doc.text(encLines, width / 2, yPos + 20, { align: 'center' });
        }

        // Disclaimer
        doc.addPage();
        doc.setFontSize(10);
        doc.text('IMPORTANT DISCLAIMER:', margin, 20);
        const disclaimer = 'This sleep plan is for educational purposes only and is not medical advice. Always consult your pediatrician.';
        const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
        doc.text(disclaimerLines, margin, 30);

        console.log("PDF generated, saving...");
        doc.save('Baby_Sleep_Guide_Premium.pdf');
    } catch (error) {
        console.error("PDF Generation logic error:", error);
        alert("PDF Error: " + error.message + "\n\nPlease check console for details.");
    }
}

// Share link
function shareLink() {
    const url = window.location.origin;

    if (navigator.share) {
        navigator.share({
            title: 'AI Baby Sleep Optimizer',
            text: 'Get a personalized baby sleep plan in 2 minutes!',
            url: url
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        });
    }
}
