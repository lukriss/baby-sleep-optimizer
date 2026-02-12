// Sleep Plan Generator - Wavespeed AI Integration
// =================================================

const axios = require('axios');

const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY;
// CORRECT Wavespeed API endpoint (verified from official documentation)
// Wavespeed uses llm.wavespeed.ai for LLM API calls, NOT api.wavespeed.ai
const WAVESPEED_API_URL = process.env.WAVESPEED_API_URL || 'https://llm.wavespeed.ai/v1/chat/completions';

// Validate configuration at startup
if (!WAVESPEED_API_KEY) {
    console.error('❌ CRITICAL: WAVESPEED_API_KEY not found in .env file');
    console.error('⚠️  AI-powered sleep plans will NOT work. App will use fallback plans only.');
    console.error('📝 Add WAVESPEED_API_KEY to your .env file to enable AI features.');
}

// Track fallback usage for monitoring
let fallbackUsageCount = 0;

/**
 * Generate personalized sleep plan using Wavespeed AI
 * @param {Object} quizData - User's quiz responses
 * @returns {Object} Structured sleep plan
 */
async function generatePlan(quizData) {
    try {
        // Construct the AI prompt
        const prompt = buildPrompt(quizData);

        // Call Wavespeed AI API
        const response = await axios.post(WAVESPEED_API_URL, {
            // IMPORTANT: Verify this model name matches your Wavespeed API plan
            // Common options: 'gpt-4', 'gpt-3.5-turbo', 'wavespeed-default', etc.
            // Check your Wavespeed dashboard for available models
            model: process.env.WAVESPEED_MODEL || 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a gentle, supportive pediatric sleep consultant with 15 years of experience helping exhausted parents. Your tone is warm, reassuring, and non-judgmental. You provide practical, age-appropriate sleep guidance based on research, but always emphasize you are NOT providing medical advice.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 3000 // Increased for premium 1500+ word detailed plan
        }, {
            headers: {
                'Authorization': `Bearer ${WAVESPEED_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Parse AI response
        const aiResponse = response.data.choices[0].message.content;

        // Structure the response
        const sleepPlan = parseAIResponse(aiResponse, quizData);

        return sleepPlan;

    } catch (error) {
        fallbackUsageCount++;

        // Log detailed error information
        console.error('⚠️  Wavespeed AI Error - Using Fallback Plan');
        console.error('Error Type:', error.code || 'Unknown');
        console.error('Error Message:', error.message);

        if (error.response) {
            console.error('API Status:', error.response.status);
            console.error('API Response:', error.response.data);
        }

        console.warn(`📊 Fallback Usage Count: ${fallbackUsageCount}`);
        console.warn('💡 Check your WAVESPEED_API_KEY, API_URL, and MODEL configuration in .env');

        return generateFallbackPlan(quizData);
    }
}

/**
 * Build comprehensive prompt for AI - Premium Sleep Consultant Mode
 */
function buildPrompt(quizData) {
    const {
        babyAge,
        feedingMethod,
        nightSleep,
        napPattern,
        bedtimeRoutine,
        sleepEnvironment,
        parentingStyle,
        primaryStruggle
    } = quizData;

    return `
You are an experienced infant sleep consultant + night nurse + empathetic coach.
You are creating a PAID, PREMIUM, PERSONALIZED sleep plan for a parent who paid for this service.
This document must feel like something a parent would gladly pay $50–$100 for.

🚨 ABSOLUTE REQUIREMENTS:
1. LENGTH & DEPTH: Minimum 1,200 words. Explanations, not just instructions. AND explain WHY.
2. PERSONALIZATION: Explicitly reference the baby’s inputs repeatedly (e.g., "Because your baby is ${getAgeLabel(babyAge)}...", "Since you prefer a ${parentingStyle} approach...").
3. NO GENERIC ADVICE: If it feels like a blog post, it is a FAILURE.

BABY PROFILE:
- Age: ${getAgeLabel(babyAge)}
- Feeding: ${feedingMethod}
- Current struggle: ${primaryStruggle}
- Parenting Style: ${parentingStyle}
- Current Sleep: ${nightSleep}
- Naps: ${napPattern}
- Environment: ${sleepEnvironment}

REQUIRED JSON OUTPUT STRUCTURE:
{
  "letter": "Section 1: Reassurance & Normalization. Emotional validation. Remove guilt.",
  "education": "Section 2: How Baby Sleep Works at This Age. Biology, sleep cycles, realistic expectations.",
  "schedule": [
    {"time": "Start Time", "activity": "Detailed activity description with 'Why'"}
  ],
  "scheduleNote": "Section 3 extra: Wake windows explained, flexibility rules, what to do if nap fails.",
  "bedtimeRoutine": {
    "steps": [{"title": "Step Name", "explanation": "Why it works"}],
    "variations": {
      "calm": "Routine for a calm night",
      "overtired": "Routine for an overtired/meltdown night"
    }
  },
  "sleepTraining": {
    "method": "Name of method based on ${parentingStyle}",
    "guide": "Section 5: Step-by-step guidance. What crying means vs doesn't mean. When to intervene. No shaming."
  },
  "feeding": "Section 6: Feeding & Sleep Timing. Cluster feeding, night feeds (normal vs optional), hungry vs overtired signs.",
  "expectations": [
    {"day": "Night 1-2", "description": "Detailed breakdown of what will likely happen"},
    {"day": "Night 3-4", "description": "Detailed breakdown"},
    {"day": "Night 5-7", "description": "Detailed breakdown plus regression warning"}
  ],
  "troubleshooting": [
    {"problem": "Baby fights naps", "solution": "Why + What to try tonight"},
    {"problem": "Wakes after 30-45 mins", "solution": "Why + What to try tonight"},
    {"problem": "False starts", "solution": "Why + What to try tonight"}
  ],
  "optimization": [
    "Tip 1: Light exposure",
    "Tip 2: Sound consistency",
    "Tip 3: Temperature/Environment"
  ],
  "encouragement": "Section 10: Final emotional encouragement. One clear action for tonight."
}

Ensure the tone is warm, calm, supportive, and non-judgmental. No medical jargon.
Return ONLY valid JSON.
`;
}

/**
 * Parse AI response into structured plan
 */
function parseAIResponse(aiResponse, quizData) {
    try {
        // Try to extract JSON from response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        // If parsing fails, return fallback
        return generateFallbackPlan(quizData);

    } catch (error) {
        console.error('Error parsing AI response:', error);
        return generateFallbackPlan(quizData);
    }
}

/**
 * Generate fallback plan if AI fails (template-based)
 */
// Helper functions for fallback plan
function generateFallbackPlan(quizData) {
    const ageSchedules = getAgeAppropriateSchedule(quizData.babyAge);
    const parentingRoutine = getRoutineByStyle(quizData.parentingStyle);

    return {
        letter: `Dear Parent,\n\nI know how exhausted you must be right now. Sleep deprivation is one of the hardest parts of parenting, and it's completely normal to feel overwhelmed. Please know that you are doing a wonderful job.\n\nThis premium plan was created to help guide you and your baby toward better rest. It’s not about being perfect; it’s about making small, consistent changes that add up. Be patient with yourself and your little one. You've got this!`,

        education: `At this age, your baby's sleep cycles are maturing. Unlike adults who cycle through sleep stages every 90 minutes, babies cycle every 45-50 minutes. This is why they often wake up after short naps or frequently at night—they are transitioning between cycles and haven't yet learned how to link them back together without help.\n\nYour goal now is not to "force" sleep, but to provide the right environment and timing so their biological sleep pressure is high enough to sleep, but not so high that they are overtired and fight it.`,

        schedule: ageSchedules,

        scheduleNote: `Wake windows are key. If your baby takes a short nap (less than 45 mins), shorten the next wake window by 15-20 minutes to prevent overtiredness only. Watch for sleepy cues like red eyebrows or staring into space—catch them before the fussing starts.`,

        bedtimeRoutine: {
            steps: parentingRoutine,
            variations: {
                calm: "Take your time with the massage and cuddles. Sing an extra song if baby is relaxed.",
                overtired: "Cut the bath. Go straight to diaper, swaddle/sack, white noise, and feeding. Get them down ASAP to avoid a meltdown."
            }
        },

        sleepTraining: {
            method: quizData.parentingStyle === 'gentle' ? "Gentle Fading" : "Graduated Intervals",
            guide: "Start by putting baby down drowsy but awake. If they protest, give them a moment to settle. Listen to the cry—is it a mantra cry (settling) or a distress cry? intervene only for distress. detailed steps would depend on your specific situation, but consistency is your best friend."
        },

        feeding: getFeedingGuidance(quizData.babyAge, quizData.feedingMethod) + "\n\nTry to keep feeds exciting during the day and boring at night to help fix day/night confusion.",

        expectations: [
            { day: "Night 1-2", description: "Expect pushback. The first night of a new routine is often the hardest. Stick to the plan." },
            { day: "Night 3-4", description: "You might see 'extinction burst' where it gets worse before it gets better. This is a sign it's working." },
            { day: "Night 5-7", description: "Things should start smoothing out. Watch for consistency in nap lengths first." }
        ],

        troubleshooting: [
            { problem: "False Starts (waking 45 mins after bedtime)", solution: "Usually caused by overtiredness. Try moving bedtime 20 minutes EARLIER tomorrow." },
            { problem: "Early Morning Waking", solution: "Treat 5 AM like the middle of the night. Keep lights off, no interaction. Ensure the first nap isn't too early." },
            { problem: "Short Naps", solution: "Practice 'crib hour'. Leave baby for the full hour nap time to encourage falling back asleep." }
        ],

        optimization: [
            "Darkness: Use blackout curtains. Pitch black is best.",
            "Sound: Continuous white noise (like rain) helps link sleep cycles.",
            "Temperature: Keep the room cool (68-72°F) for best sleep."
        ],

        encouragement: `You are the best parent for your baby. Trust your instincts. If tonight falls apart, that's okay. Tomorrow is a new day. Focus on progress, not perfection.`
    };
}

// Helper functions for fallback plan
function getAgeLabel(babyAge) {
    const labels = {
        '0-6weeks': '0-6 week old',
        '6-12weeks': '6-12 week old',
        '3-4months': '3-4 month old',
        '5-6months': '5-6 month old',
        '7-9months': '7-9 month old',
        '10-12months': '10-12 month old',
        '12-18months': '12-18 month old',
        '18-24months': '18-24 month old'
    };
    return labels[babyAge] || 'baby';
}

function getAgeAppropriateSchedule(babyAge) {
    const schedules = {
        '0-6weeks': [
            { time: '7:00 AM', activity: 'Wake and feed' },
            { time: '7:45 AM', activity: 'Nap 1 (1-2 hours)' },
            { time: '10:00 AM', activity: 'Wake and feed' },
            { time: '10:45 AM', activity: 'Nap 2 (1-2 hours)' },
            { time: '1:00 PM', activity: 'Wake and feed' },
            { time: '1:45 PM', activity: 'Nap 3 (1-2 hours)' },
            { time: '4:00 PM', activity: 'Wake and feed' },
            { time: '4:45 PM', activity: 'Catnap (30-45 min)' },
            { time: '6:30 PM', activity: 'Feed and start bedtime routine' },
            { time: '7:30 PM', activity: 'Bedtime' },
            { time: 'Night', activity: 'Wake for feeds every 2-3 hours (normal for newborns)' }
        ],
        '3-4months': [
            { time: '7:00 AM', activity: 'Wake and feed' },
            { time: '8:30 AM', activity: 'Nap 1 (1-1.5 hours)' },
            { time: '11:00 AM', activity: 'Wake and feed' },
            { time: '12:30 PM', activity: 'Nap 2 (1-1.5 hours)' },
            { time: '3:00 PM', activity: 'Wake and feed' },
            { time: '4:30 PM', activity: 'Catnap (30-45 min)' },
            { time: '6:00 PM', activity: 'Feed and playtime' },
            { time: '6:45 PM', activity: 'Start bedtime routine' },
            { time: '7:30 PM', activity: 'Bedtime' },
            { time: 'Night', activity: 'May wake 1-2 times for feeding' }
        ],
        '5-6months': [
            { time: '6:30 AM', activity: 'Wake and feed' },
            { time: '8:30 AM', activity: 'Nap 1 (1-1.5 hours)' },
            { time: '11:00 AM', activity: 'Wake and feed' },
            { time: '1:00 PM', activity: 'Nap 2 (1-1.5 hours)' },
            { time: '3:30 PM', activity: 'Wake and feed' },
            { time: '5:00 PM', activity: 'Optional catnap (30 min)' },
            { time: '6:00 PM', activity: 'Dinner and playtime' },
            { time: '6:45 PM', activity: 'Start bedtime routine' },
            { time: '7:30 PM', activity: 'Bedtime' },
            { time: 'Night', activity: 'May sleep through or wake once' }
        ],
        '7-9months': [
            { time: '6:30 AM', activity: 'Wake and feed' },
            { time: '9:00 AM', activity: 'Nap 1 (1-1.5 hours)' },
            { time: '12:00 PM', activity: 'Lunch and feed' },
            { time: '2:00 PM', activity: 'Nap 2 (1-1.5 hours)' },
            { time: '5:00 PM', activity: 'Dinner' },
            { time: '6:30 PM', activity: 'Start bedtime routine' },
            { time: '7:00 PM', activity: 'Bedtime' },
            { time: 'Night', activity: 'Most babies sleep through at this age' }
        ],
        '10-12months': [
            { time: '6:30 AM', activity: 'Wake and breakfast' },
            { time: '9:30 AM', activity: 'Nap 1 (1-1.5 hours)' },
            { time: '12:00 PM', activity: 'Lunch' },
            { time: '2:30 PM', activity: 'Nap 2 (1-1.5 hours)' },
            { time: '5:30 PM', activity: 'Dinner' },
            { time: '6:45 PM', activity: 'Start bedtime routine' },
            { time: '7:30 PM', activity: 'Bedtime' }
        ],
        '12-18months': [
            { time: '7:00 AM', activity: 'Wake and breakfast' },
            { time: '12:30 PM', activity: 'Lunch then nap (2-2.5 hours)' },
            { time: '5:30 PM', activity: 'Dinner' },
            { time: '7:00 PM', activity: 'Start bedtime routine' },
            { time: '7:45 PM', activity: 'Bedtime' }
        ]
    };

    return schedules[babyAge] || schedules['5-6months'];
}

function getRoutineByStyle(parentingStyle) {
    const gentle = [
        { title: 'Environment Change', explanation: 'Dim the lights and turn off screens 30 minutes before sleep. This boosts melatonin production.' },
        { title: 'Warm Bath', explanation: 'A 5-10 minute soak resets the nervous system. Keep it calm and quiet.' },
        { title: 'Massage & PJs', explanation: 'Use gentle strokes with lotion. This physical touch reduces cortisol (stress hormone).' },
        { title: 'Feeding', explanation: 'Offer the final feed in the dimly lit bedroom to associate milk with sleepiness, not play.' },
        { title: 'White Noise On', explanation: 'Turn on continuous white noise (like rain or a fan) to block household sounds.' },
        { title: 'Cuddle & Song', explanation: 'Sing the same lullaby every night. The repetition signals safety.' },
        { title: 'Drowsy Transfer', explanation: 'Place baby in the crib while they are heavy-eyed but still slightly awake. Stay close and pat until asleep.' }
    ];

    const moderate = [
        { title: 'Calm Down Signals', explanation: 'Close curtains and use soft voices. Signal that high-energy play is over.' },
        { title: 'Bath Routine', explanation: 'A consistent bath time is the strongest anchor for a bedtime routine.' },
        { title: 'Diaper & Pajamas', explanation: 'Change into a fresh overnight diaper and comfortable sleep sack.' },
        { title: 'Final Feed', explanation: 'Ensure a full feed so baby isn\'t waking from hunger. Keep interaction low-key.' },
        { title: 'Story Time', explanation: 'Read one short, rhythmic book. This helps their brain wind down.' },
        { title: 'Into Crib', explanation: 'Place baby down awake. Say your "key phrase" (e.g., "Night night, I love you").' },
        { title: 'The Pause', explanation: 'If baby fusses, wait 5-10 minutes before entering. Give them a chance to settle.' }
    ];

    const cio = [
        { title: 'Hygiene & Prep', explanation: 'Quick bath, lotion, and pajamas. Keep this part loving but efficient (15 mins).' },
        { title: 'Full Feed', explanation: 'Ensure baby is fully fed. Do this outside the bedroom if possible to break feed-to-sleep association.' },
        { title: 'Reading & Cuddles', explanation: 'Read a book and have a solid 5 minutes of focused cuddling.' },
        { title: 'White Noise', explanation: 'Turn on sound machine. This becomes a strong sleep cue.' },
        { title: 'Crib Placement', explanation: 'Place baby in crib completely awake. Say a confident goodnight.' },
        { title: 'Exit', explanation: 'Leave the room immediately. Checks are done only at specific long intervals (if using Ferber) or not at all (Extinction).' }
    ];

    if (parentingStyle === 'gentle') return gentle;
    if (parentingStyle === 'cio') return cio;
    return moderate; // Default for 'moderate' or 'unsure'
}

function getFeedingGuidance(babyAge, feedingMethod) {
    const guidance = {
        '0-6weeks': 'Feed on demand every 2-3 hours, including overnight. This is normal and healthy for newborns.',
        '6-12weeks': 'Aim for feeds every 2.5-3 hours during the day. Nighttime stretches may extend to 4-5 hours.',
        '3-4months': 'Most babies can go 3-4 hours between daytime feeds. Night feeds may reduce to 1-2.',
        '5-6months': 'Solid foods may start. Continue 4-5 milk feeds during the day, possibly 1 overnight.',
        '7-9months': '3 meals + 3-4 milk feeds. Many babies drop night feeds at this age.',
        '10-12months': '3 meals + snacks + 2-3 milk feeds. Most babies sleep through without feeding.',
        '12-18months': 'Regular meals with 1-2 milk feeds. Night feeding usually unnecessary.',
        '18-24months': 'Table foods and 1-2 milk servings. Should sleep through the night.'
    };

    return guidance[babyAge] || 'Consult your pediatrician for feeding guidance appropriate to your baby\'s age.';
}

module.exports = {
    generatePlan,
    getStats: () => ({
        fallbackUsageCount,
        apiKeyConfigured: !!WAVESPEED_API_KEY
    })
};
