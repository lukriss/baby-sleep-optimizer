// Sleep Plan Generator
const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';

if (!OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not set — fallback plans will be used.');
}

let fallbackUsageCount = 0;

async function generatePlan(quizData) {
    try {
        const prompt = buildPrompt(quizData);
        const response = await axios.post(OPENAI_API_URL, {
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are an experienced pediatric sleep consultant. You write warm, practical, science-backed sleep plans for exhausted parents. You return ONLY valid JSON — no markdown, no code fences, no commentary.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.65,
            max_tokens: 4000
        }, {
            headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }
        });

        const raw = response.data.choices[0].message.content;
        return parseAIResponse(raw, quizData);
    } catch (error) {
        fallbackUsageCount++;
        console.error('AI error, using fallback:', error.message);
        return generateFallbackPlan(quizData);
    }
}

function buildPrompt(quizData) {
    const { babyName, babyAge, feedingMethod, nightSleep, napPattern, parentingStyle, primaryStruggle, sleepEnvironment } = quizData;
    const name = babyName || 'your baby';
    const ageLabel = getAgeLabel(babyAge);

    return `
You are writing a PAID, PREMIUM, personalized baby sleep plan. The parent paid real money for this. It must feel worth every cent.

BABY PROFILE:
- Name: ${name}
- Age: ${ageLabel}
- Feeding: ${feedingMethod}
- Night sleep: ${nightSleep}
- Naps: ${napPattern}
- Parenting style: ${parentingStyle}
- Main struggle: ${primaryStruggle}
- Sleep environment: ${sleepEnvironment}

CRITICAL RULES:
1. Use "${name}" by name throughout ALL sections — not "your baby" or "baby"
2. Every explanation must reference the specific age (${ageLabel}) and the specific struggle (${primaryStruggle})
3. Be warm but practical. No fluff. Every sentence must earn its place.
4. Schedule times must be realistic and internally consistent (times only go forward, durations add up)
5. Return ONLY valid JSON matching the schema below. No markdown. No code fences. Start with { and end with }

REQUIRED JSON SCHEMA (fill every field, no nulls):
{
  "babyTags": ["tag1 with emoji", "tag2 with emoji", "tag3 with emoji"],
  "sleepScore": 42,
  "sleepScoreLabel": "Room to Grow",
  "sleepScoreNote": "One sentence explaining the score based on their specific inputs.",
  "tonightsFocus": "One specific, achievable action for tonight based on ${name}'s biggest struggle.",

  "wakeWindowsDesc": "2-sentence explanation tailored to ${ageLabel}. Reference ${name}.",
  "wwTip": "One specific tip for ${name} based on napPattern: ${napPattern}.",
  "wakeWindows": [
    {"label": "Window 1", "duration": "XX min", "note": "context note"},
    {"label": "Window 2", "duration": "XX min", "note": "context note"},
    {"label": "Window 3", "duration": "XX min", "note": "context note"},
    {"label": "Window 4", "duration": "XX min", "note": "context note"},
    {"label": "Window 5", "duration": "XX min", "note": "context note or omit if fewer windows"}
  ],

  "dayBarLabel": "6:30 AM → 7:00 PM (${name}'s Day)",
  "dayBarNote": "One sentence tip for ${name} about following cues vs clock.",
  "dayBar": [
    {"type": "awake", "flex": 1, "label": "Wake"},
    {"type": "nap", "flex": 1.5, "label": "Nap 1"}
  ],

  "schedule": [
    {
      "time": "6:30 AM — Morning Wake",
      "label": "🌅 Wake + First Feed",
      "detail": "Detailed, personalized action. Explain WHY. Mention ${name} by name. 2-3 sentences.",
      "type": "wake"
    }
  ],
  "scheduleNote": "Wake window flexibility note specific to ${name}'s napPattern and primaryStruggle.",

  "bedtimeRoutine": [
    {"title": "Step name", "desc": "Why this works for ${name}. What to do exactly.", "time": "HH:MM PM • X minutes"}
  ],

  "nightPlanOverview": "2-3 sentences explaining ${name}'s night situation at ${ageLabel}. What's normal, what's not.",
  "nightPlanNormalNote": "What's normal for ${ageLabel} at night in terms of waking count/duration.",
  "decisionTree": [
    {
      "question": "How long since ${name}'s last feed?",
      "lessAnswer": "Less than 2 hrs → what to do",
      "moreAnswer": "More than 2.5 hrs → what to do"
    },
    {
      "question": "After waiting — is crying escalating?",
      "lessAnswer": "Distress cry → what to do",
      "moreAnswer": "Fussing/mantra cry → what to do"
    },
    {
      "question": "Feeding — what's the protocol?",
      "lessAnswer": "Boring feed: no lights, no talking, no eye contact",
      "moreAnswer": "Back in crib after burp — no playtime"
    },
    {
      "question": "Fed but won't settle?",
      "lessAnswer": "Gentle settle sequence steps numbered",
      "moreAnswer": "How long this may take and what to expect"
    }
  ],
  "nightSchedule": [
    {"time": "10:00–10:30 PM", "label": "🍼 Dream Feed (optional)", "detail": "Why and how. Specific to ${name}.", "type": "feed"},
    {"time": "1:30–2:30 AM", "label": "🍼 Night Feed 1", "detail": "What to do.", "type": "feed"},
    {"time": "4:30–5:30 AM", "label": "🍼 Early Morning — Keep Dark", "detail": "What to do. When to start the day.", "type": "feed"},
    {"time": "6:30 AM", "label": "🌅 Day Starts", "detail": "Open curtains, bright voice.", "type": "wake"}
  ],
  "dreamFeedTip": "Specific recommendation on dream feed for ${name} based on age and night pattern.",

  "sleepTrainingOverview": "2-3 sentences explaining the gentle approach for ${name} at ${ageLabel}. What is realistic.",
  "sleepTrainingWeekGoal": "Specific this-week goal for ${name} — one nap, one layer reduction.",
  "sleepTrainingLayers": [
    {"level": 5, "label": "Feeding to sleep + holding", "note": "← Where ${name} may be now", "isHere": true},
    {"level": 4, "label": "Rocking/bouncing to drowsy → transfer to crib", "note": ""},
    {"level": 3, "label": "Holding still → transfer drowsy", "note": ""},
    {"level": 2, "label": "In crib → hand on chest + shushing", "note": ""},
    {"level": 1, "label": "In crib → ${name} falls asleep independently", "note": "← Goal (4-6 months)"}
  ],
  "sleepTrainingWarning": "Age-specific warning about not rushing for ${name} at ${ageLabel}.",

  "troubleshooting": [
    {"problem": "Wakes exactly 45 minutes into every nap", "solution": "Why this happens + step-by-step fix for ${name}"},
    {"problem": "False starts — wakes 30-45 min after bedtime", "solution": "Why + fix specific to ${name}"},
    {"problem": "Early morning waking before 6 AM", "solution": "Why + fix specific to ${name}"},
    {"problem": "Will only sleep while being held", "solution": "Gentle week-by-week transition for ${name}"},
    {"problem": "Fights every nap", "solution": "Why + what to try tonight for ${name}"}
  ],

  "weekByWeek": [
    {"label": "Week 1 (Now)", "title": "🌱 Foundation", "desc": "What to expect. What ${name} may do. One focus.", "isCurrent": true},
    {"label": "Week 2", "title": "📉 The Dip", "desc": "Why it may get worse. What to do. Stay consistent.", "isCurrent": false},
    {"label": "Week 3", "title": "📈 Progress", "desc": "What improvement looks like for ${name}.", "isCurrent": false},
    {"label": "Week 4", "title": "🎉 Rhythm", "desc": "Expected wins by week 4.", "isCurrent": false}
  ],
  "regressionWarning": "What regression is coming soon for ${ageLabel} and how the plan prepares for it.",

  "environment": [
    {"title": "Blackout curtains", "desc": "Specific guidance for ${name}'s environment (${sleepEnvironment})."},
    {"title": "White noise machine", "desc": "Volume, type, placement guidance."},
    {"title": "Room temperature 68-72°F", "desc": "Why and how to check."},
    {"title": "Swaddle or sleep sack", "desc": "Age-appropriate recommendation for ${ageLabel}."},
    {"title": "Empty crib", "desc": "Safety reminder."},
    {"title": "Red nightlight for feeds", "desc": "Why red light and how to use it."}
  ],

  "emergencyCards": [
    {"title": "😭 ${name} is SCREAMING", "action": "Specific calm-down steps for ${name}."},
    {"title": "😤 Fussing but not screaming", "action": "Wait protocol. Hand on chest. When to pick up."},
    {"title": "👀 Awake but quiet/happy", "action": "Do NOT go in. Wait time. When to check."},
    {"title": "🤢 Spit up / blowout", "action": "Efficient clean-up protocol. Keep it boring."},
    {"title": "⏰ It's 5 AM and awake", "action": "Treat as night. Dark + boring until 6 AM."},
    {"title": "💀 I've been up for 2 hours", "action": "Cap it. Do what works. One bad night = no setback."}
  ],

  "caregiverSheet": {
    "schedule": ["Wake windows: X-Y min between naps", "Watch for: yawning, red eyebrows, looking away", "Naps per day: X-X", "Bedtime: X:XX PM (±15 min)", "Do not start day before 6:00 AM"],
    "howToSettle": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
    "doNot": ["Don't 1", "Don't 2", "Don't 3", "Don't 4", "Don't 5"],
    "ifCrying": ["Check hunger", "Check overtired", "Check diaper", "Check temp", "If all good: hold + bounce + shush"]
  },

  "regressions": [
    {"age": "📍 NOW — ${ageLabel}", "title": "Current Phase", "desc": "What ${name} is experiencing now and how to handle it.", "isCurrent": true},
    {"age": "~3-4 Months", "title": "The 4-Month Regression", "desc": "What happens + action plan.", "isCurrent": false},
    {"age": "~8-10 Months", "title": "Separation Anxiety + Mobility", "desc": "What happens + action plan.", "isCurrent": false},
    {"age": "~12 Months", "title": "Nap Transition Fake-Out", "desc": "What happens + action plan.", "isCurrent": false},
    {"age": "~18 Months", "title": "Toddler Sleep Regression", "desc": "What happens + action plan.", "isCurrent": false}
  ],

  "travel": [
    {"title": "✈️ Flying with ${name}", "body": "Before/during/after flight tips. Time zone shift strategy."},
    {"title": "🏨 Hotels / Airbnbs", "body": "What to bring. Routine portability. First night tips."},
    {"title": "🎄 Holidays / Schedule Chaos", "body": "80/20 rule. Protect bedtime. Recovery plan."},
    {"title": "🤒 When ${name} Is Sick", "body": "Throw schedule out. Recovery protocol. Re-training timeline."}
  ],

  "milestones": [
    {"age": "📍 ${ageLabel} (now)", "naps": "X-X", "wakeWindows": "XX-XX min", "nightSleep": "X-X hrs", "nightFeeds": "X-X", "isCurrent": true},
    {"age": "3 months", "naps": "3-4", "wakeWindows": "75-90 min", "nightSleep": "10-12 hrs", "nightFeeds": "2", "isCurrent": false},
    {"age": "4-5 months", "naps": "3", "wakeWindows": "1.5-2.25 hrs", "nightSleep": "11-12 hrs", "nightFeeds": "1-2", "isCurrent": false},
    {"age": "6-8 months", "naps": "2", "wakeWindows": "2.5-3 hrs", "nightSleep": "11-12 hrs", "nightFeeds": "0-1", "isCurrent": false},
    {"age": "9-14 months", "naps": "2", "wakeWindows": "3-3.75 hrs", "nightSleep": "11-12 hrs", "nightFeeds": "0", "isCurrent": false},
    {"age": "15-24 months", "naps": "1", "wakeWindows": "4.5-5.5 hrs", "nightSleep": "11-12 hrs", "nightFeeds": "0", "isCurrent": false}
  ]
}

IMPORTANT REMINDERS:
- sleepScore is an integer 0-100 based on their current situation (more waking = lower score, good environment = higher)
- dayBar flex values must be numeric (not strings), sum to ~13-14 total, and types only: "awake", "nap", "routine"
- schedule item "type" must be one of: "wake", "sleep", "feed", "routine"
- All times in schedule must be chronological AM → PM
- bedtimeRoutine must have 6-7 steps with real timestamps
- ALL content must be specific to ${name} (${ageLabel}) — zero generic content allowed
`;
}

function parseAIResponse(raw, quizData) {
    try {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        return generateFallbackPlan(quizData);
    } catch (e) {
        console.error('JSON parse error:', e.message);
        return generateFallbackPlan(quizData);
    }
}

function getAgeLabel(babyAge) {
    const labels = {
        '0-6weeks': '0-6 weeks old', '6-12weeks': '6-12 weeks old',
        '3-4months': '3-4 months old', '5-6months': '5-6 months old',
        '7-9months': '7-9 months old', '10-12months': '10-12 months old',
        '12-18months': '12-18 months old', '18-24months': '18-24 months old'
    };
    return labels[babyAge] || 'your baby';
}

function generateFallbackPlan(quizData) {
    const name = quizData.babyName || 'your baby';
    const age = quizData.babyAge || '5-6months';
    const ageLabel = getAgeLabel(age);
    const style = quizData.parentingStyle || 'gentle';
    const struggle = quizData.primaryStruggle || 'night-wakings';

    const isNewborn = age === '0-6weeks' || age === '6-12weeks';
    const wwDuration = isNewborn ? '60-75' : age === '3-4months' ? '75-90' : '2-3 hrs';

    return {
        babyTags: [
            struggle === 'night-wakings' ? '🌙 Frequent Night Wakings' : '😴 ' + struggle.replace(/-/g, ' '),
            style === 'gentle' ? '💛 Gentle / No Cry' : style === 'cio' ? '💪 Cry-It-Out' : '⚖️ Moderate Approach',
            '📅 New Plan Started'
        ],
        sleepScore: 45,
        sleepScoreLabel: 'Room to Grow',
        sleepScoreNote: `Based on ${name}'s current sleep patterns, there's real room for improvement — and this plan is designed to get you there.`,
        tonightsFocus: struggle === 'night-wakings'
            ? `Start the bedtime routine 30 minutes earlier tonight and keep lights dim from 5:30 PM.`
            : struggle === 'bedtime-battles'
            ? `Do bedtime routine same steps, same order. Pick ONE change and be consistent.`
            : `Adjust ${name}'s first wake window to the recommended duration and watch for sleepy cues.`,

        wakeWindowsDesc: `At ${ageLabel}, ${name}'s nervous system can only handle short awake periods before sleep pressure builds too high. Going past these windows causes cortisol spikes that make sleep harder, not easier.`,
        wwTip: `Because ${name} is showing irregular nap patterns, watch for sleepy cues (yawning, looking away, red eyebrows) rather than watching the clock strictly.`,
        wakeWindows: isNewborn ? [
            { label: 'Window 1', duration: '60 min', note: 'shortest of the day' },
            { label: 'Window 2', duration: '75 min', note: 'mid-morning' },
            { label: 'Window 3', duration: '75 min', note: 'afternoon' },
            { label: 'Window 4', duration: '75 min', note: 'late afternoon' },
            { label: 'Window 5', duration: '60 min', note: 'before bed — keep calm' }
        ] : [
            { label: 'Window 1', duration: '2 hrs', note: 'morning window' },
            { label: 'Window 2', duration: '2.5 hrs', note: 'midday' },
            { label: 'Window 3', duration: '2.5 hrs', note: 'afternoon' },
            { label: 'Window 4', duration: '2 hrs', note: 'before bedtime' }
        ],

        dayBarLabel: `6:30 AM → 7:00 PM (${name}'s Day)`,
        dayBarNote: `At ${ageLabel}, follow ${name}'s sleepy cues over the clock — cues are more reliable than the timer.`,
        dayBar: isNewborn ? [
            { type: 'awake', flex: 1, label: 'Wake' },
            { type: 'nap', flex: 1.5, label: 'Nap 1' },
            { type: 'awake', flex: 1.25, label: 'Wake' },
            { type: 'nap', flex: 1.5, label: 'Nap 2' },
            { type: 'awake', flex: 1.25, label: 'Wake' },
            { type: 'nap', flex: 1.5, label: 'Nap 3' },
            { type: 'awake', flex: 1.25, label: 'Wake' },
            { type: 'nap', flex: 1, label: 'Nap 4' },
            { type: 'awake', flex: 1, label: 'Wake' },
            { type: 'routine', flex: 0.75, label: '🌙' }
        ] : [
            { type: 'awake', flex: 2, label: 'Wake' },
            { type: 'nap', flex: 1.5, label: 'Nap 1' },
            { type: 'awake', flex: 2.5, label: 'Wake' },
            { type: 'nap', flex: 1.5, label: 'Nap 2' },
            { type: 'awake', flex: 2, label: 'Wake' },
            { type: 'routine', flex: 0.75, label: '🌙' }
        ],

        schedule: isNewborn ? [
            { time: '6:30 AM — Morning Wake', label: '🌅 Wake + First Feed', detail: `Open curtains immediately. Feed ${name} in a bright room. This morning light exposure sets ${name}'s circadian clock — it tells the brain "daytime starts now."`, type: 'wake' },
            { time: '7:30 AM — Nap 1', label: `😴 Nap 1 — "The Easy Nap" (1.5-2 hrs)`, detail: `Watch for yawning around 7:15. Swaddle, white noise, dark room. This nap comes easily because sleep pressure from the night is still high.`, type: 'sleep' },
            { time: '9:15 AM — Wake Window 2', label: '🎮 Feed + Play', detail: `Feed right after waking. Tummy time (3-5 min supervised), high-contrast cards, or talking to ${name}. Keep it gently stimulating.`, type: 'wake' },
            { time: '10:30 AM — Nap 2', label: `😴 Nap 2 — "The Long Nap" (1.5-2 hrs)`, detail: `Often the best nap of the day. If ${name} wakes at 45 minutes, wait 3-5 minutes — the next cycle may connect.`, type: 'sleep' },
            { time: '12:15 PM — Wake Window 3', label: '🍼 Feed + Outdoor Time', detail: `Great time for a walk — natural light helps ${name} distinguish day from night. Carrier or stroller both work.`, type: 'feed' },
            { time: '1:30 PM — Nap 3', label: `😴 Nap 3 — "The Afternoon Reset" (1-1.5 hrs)`, detail: `Prevents the late-afternoon overtired spiral. Can be stroller or carrier if needed.`, type: 'sleep' },
            { time: '3:00 PM — Wake Window 4', label: '🎮 Feed + Gentle Play', detail: `Feed, some calm activity. Keep things slightly calmer than morning windows.`, type: 'wake' },
            { time: '4:15 PM — Nap 4', label: `😴 Nap 4 — "The Bridge Nap" (30-45 min)`, detail: `Short catnap. Its only job is to bridge ${name} to bedtime without overtiredness.`, type: 'sleep' },
            { time: '5:00 PM — Final Wake Window', label: '🧸 Wind Down Begins', detail: `Dim lights at 5:30. No overhead lights. This signals ${name}'s brain to begin melatonin production.`, type: 'wake' },
            { time: '6:00 PM — Bedtime Routine', label: '🛁 Bedtime Routine (30 min)', detail: `Same steps, same order, every night. Consistency is the cue that tells ${name} sleep is coming.`, type: 'routine' },
            { time: '6:30 PM — Bedtime', label: `🌙 Into Crib — Goodnight ${name}`, detail: `Swaddled, white noise on, room dark. Place drowsy but aware. Hand on chest, gentle shushing.`, type: 'sleep' }
        ] : [
            { time: '6:30 AM — Morning Wake', label: '🌅 Wake + Feed', detail: `Open curtains immediately. Feed ${name} in a bright room to set the circadian clock.`, type: 'wake' },
            { time: '8:30 AM — Nap 1', label: '😴 Nap 1 (1-1.5 hrs)', detail: `Watch for sleepy cues around 8:15. Dark room, white noise, sleep sack.`, type: 'sleep' },
            { time: '10:00 AM — Wake Window 2', label: '🎮 Feed + Active Play', detail: `Feed after waking. Good time for stimulating activities and tummy time.`, type: 'wake' },
            { time: '12:30 PM — Nap 2', label: `😴 Nap 2 — "The Long Nap" (1.5-2 hrs)`, detail: `${name}'s restorative midday nap. Protect this one — it sets up the whole afternoon.`, type: 'sleep' },
            { time: '2:30 PM — Wake Window 3', label: '🍼 Feed + Calm Play', detail: `Start winding energy down. Good time for books, floor play, or a walk.`, type: 'feed' },
            { time: '5:00 PM — Wind Down', label: '🧸 Calm Time', detail: `Dim lights starting at 5:30. Calm activities only. This cues melatonin production.`, type: 'wake' },
            { time: '6:15 PM — Bedtime Routine', label: '🛁 Bedtime Routine (30 min)', detail: `Same steps every night. The repetition is the sleep cue for ${name}.`, type: 'routine' },
            { time: '7:00 PM — Bedtime', label: `🌙 Goodnight ${name}`, detail: `In crib, white noise on, room dark. Drowsy but aware. Stay close until settled.`, type: 'sleep' }
        ],

        scheduleNote: `Wake windows are key for ${name}. If a nap runs short (under 45 min), shorten the next wake window by 15 minutes to avoid overtiredness compounding.`,

        bedtimeRoutine: [
            { title: 'Dim the House', desc: `Close blinds, switch to lamps. This triggers melatonin production in ${name}'s brain — blue light suppresses it.`, time: '6:00 PM • 1 min' },
            { title: 'Warm Bath', desc: `5 minutes, calm and quiet. The temperature drop afterward is biology — it signals sleepiness. Don't skip on busy nights.`, time: '6:01 PM • 5 min' },
            { title: 'Lotion Massage + PJs', desc: `Gentle strokes on arms, legs, belly. Reduces cortisol. Put on sleep sack or swaddle.`, time: '6:06 PM • 5 min' },
            { title: 'Move to Bedroom + White Noise', desc: `Continuous white noise (~65 dB, like a shower). Room should be pitch dark. These two cues tell ${name}: sleep space.`, time: '6:11 PM • 1 min' },
            { title: 'Final Feed', desc: `Full feed in the dark room. ${isNewborn ? `If ${name} falls asleep during the feed at this age, that is completely fine.` : `Try to keep ${name} slightly awake at the end of the feed.`}`, time: '6:12 PM • 12 min' },
            { title: 'Cuddle + Song', desc: `Hold upright for 1-2 minutes (helps with reflux). Same song every night — the repetition becomes a sleep cue.`, time: '6:24 PM • 3 min' },
            { title: 'Place in Crib', desc: `Drowsy but slightly aware. Hand on chest, rhythmic patting, gentle shushing. Stay until calm.`, time: '6:27 PM • until settled' }
        ],

        nightPlanOverview: `${name}'s main struggle is ${struggle.replace(/-/g, ' ')}. At ${ageLabel}, some night waking is normal and necessary — the goal isn't to eliminate all waking, it's to handle wakings in a way that helps ${name} learn to resettle over time.`,
        nightPlanNormalNote: isNewborn ? `Most ${ageLabel} babies wake 2-4 times per night for feeds. ${name} likely needs 2-3 night feeds. Anything beyond that may be habitual waking.` : `At ${ageLabel}, 1-2 night feeds may still be normal. If ${name} is waking more than that, this plan addresses the habitual component.`,

        decisionTree: [
            { question: `How long since ${name}'s last feed?`, lessAnswer: `Less than 2 hours → Likely NOT hunger. Wait 2-3 minutes. ${name} may be transitioning between sleep cycles and could resettle alone.`, moreAnswer: `More than 2.5 hours → Likely a hunger waking. Go comfort and feed.` },
            { question: `After waiting — is crying escalating?`, lessAnswer: `Escalating/distress cry → Go in. Pick up, comfort, offer feed. Always respond to distress with the gentle approach.`, moreAnswer: `Fussing/grunting but not escalating → Wait. This "mantra crying" often resolves in 5-8 minutes. Hand on chest, shush, don't pick up yet.` },
            { question: `You're feeding — what's the protocol?`, lessAnswer: `Keep it BORING: no lights, no talking, no eye contact, no diaper change unless dirty. Feed, burp, back in crib.`, moreAnswer: `The message to ${name}: "Nighttime is for sleeping, not socializing."` },
            { question: `Fed and changed but still won't settle?`, lessAnswer: `Gentle Settling: 1) Hand on chest + shush (2 min) → 2) Gentle rocking (2 min) → 3) Offer pacifier → 4) Place drowsy → repeat if needed.`, moreAnswer: `This may take 20-30 minutes at first. It will get faster within 1-2 weeks as ${name} learns the pattern.` }
        ],

        nightSchedule: [
            { time: '10:00–10:30 PM', label: '🍼 Dream Feed (optional)', detail: `Gently lift ${name}, feed without fully waking. Tops off the tank — may extend the first sleep stretch to 5-6 hours.`, type: 'feed' },
            { time: '1:30–2:30 AM', label: '🍼 Night Feed 1', detail: `Expected at this age. Keep it boring — dark, quiet, no stimulation. Feed, burp, back in crib.`, type: 'feed' },
            { time: '4:30–5:30 AM', label: '🍼 Early Morning', detail: `Hardest waking — dawn cortisol rising. Keep ${name} in the dark room. Do NOT start the day before 6:00 AM.`, type: 'feed' },
            { time: '6:30 AM', label: '🌅 Day Starts', detail: `Open curtains, bright light, enthusiastic voice. Signal: "NOW it's daytime!"`, type: 'wake' }
        ],
        dreamFeedTip: `Try the dream feed for 5 nights consistently. Many parents of ${ageLabel} babies find it extends the first stretch from 3-4 hours to 5-6 hours. If it doesn't help after 5 nights, drop it.`,

        sleepTrainingOverview: `You chose the ${style === 'gentle' ? 'gentle/no-cry' : style === 'cio' ? 'cry-it-out' : 'moderate'} approach. ${isNewborn ? `At ${ageLabel}, we are NOT formally sleep training yet — we are building the foundations and habits that will make training much easier at 4+ months.` : `At ${ageLabel}, ${name} is ready to start building independent sleep skills.`}`,
        sleepTrainingWeekGoal: `This week: try ONE nap per day (the first nap, when sleep pressure is highest) where you put ${name} down at Layer 4 instead of Layer 5. If it works, celebrate. If not, no problem — do whatever works for other naps.`,
        sleepTrainingLayers: [
            { level: 5, label: `Feeding to sleep + holding`, note: `← Where ${name} may be now. That's OK.`, isHere: true },
            { level: 4, label: 'Rocking/bouncing to drowsy → transfer to crib', note: '', isHere: false },
            { level: 3, label: 'Holding still → transfer drowsy', note: '', isHere: false },
            { level: 2, label: 'In crib → hand on chest + shushing', note: '', isHere: false },
            { level: 1, label: `In crib → ${name} falls asleep independently`, note: '← Long-term goal (4-6 months)', isHere: false }
        ],
        sleepTrainingWarning: `Do NOT rush through these layers. Spend 1-2 weeks at each. If ${name} resists a layer reduction, go back one layer for a few days, then try again. Progress, not perfection.`,

        troubleshooting: [
            { problem: `${name} wakes exactly 45 minutes into every nap`, solution: `One sleep cycle is ~45 min. At the 35-min mark, quietly stand near the crib. When ${name} stirs, immediately place your hand on their chest and shush. Do this for 5-7 days, then wait an extra minute each time.` },
            { problem: `"False starts" — wakes 30-45 min after bedtime`, solution: `Almost always overtiredness. Move bedtime 15-20 minutes EARLIER tomorrow. Check if the last wake window exceeded the recommended duration. Make sure the bridge nap happened.` },
            { problem: `Early morning waking before 6 AM`, solution: `Do NOT start the day before 6:00 AM. Feed in the dark, try to resettle. Even if ${name} won't sleep, quiet time in the dark teaches that pre-6 = nighttime. Check for light leaks.` },
            { problem: `${name} will only sleep while being held`, solution: `Week 1: one crib nap per day (Nap 1 — highest sleep pressure). Week 2: add Nap 2. Week 3: add Nap 3. If a crib nap fails after 15 min of trying, pick up — no guilt.` },
            { problem: `Fights every single nap`, solution: `Watch wake windows closely. ${name} fighting naps often means overtiredness (gone past the window) or under-tiredness (window too short). Try the first nap 10 minutes earlier for 3 days.` }
        ],

        weekByWeek: [
            { label: 'Week 1 (Now)', title: '🌱 Foundation', desc: `Implement the schedule. Focus on the consistent bedtime routine. Don't aim for perfection — aim for showing up. Expect some resistance and many "this isn't working" moments. That's normal.`, isCurrent: true },
            { label: 'Week 2', title: '📉 The Dip', desc: `Things may feel WORSE before better. ${name} is adjusting. You may see an "extinction burst" — more waking as old patterns are tested. STAY CONSISTENT. This is a sign it's working.`, isCurrent: false },
            { label: 'Week 3', title: '📈 Progress', desc: `Naps start getting more predictable. Bedtime routine should feel smooth and familiar. ${name} may start showing sleepy cues BEFORE becoming overtired. Night stretch may extend.`, isCurrent: false },
            { label: 'Week 4', title: '🎉 Rhythm', desc: `A rough daily rhythm emerges. Night wakings should reduce. You can start to predict ${name}'s nap times. The bedtime routine takes less effort. Celebrate the wins.`, isCurrent: false }
        ],
        regressionWarning: isNewborn ? `At ~3-4 months, ${name}'s sleep cycles permanently mature. This causes a temporary increase in night wakings. The foundations you're building NOW will make that regression much shorter.` : `Watch for the next developmental leap — it brings temporary sleep disruption. Your plan includes regenerations to get an updated schedule when it hits.`,

        environment: [
            { title: 'Blackout curtains', desc: `The room should be dark enough you can't see your hand at nap time. Use blackout curtains + blackout film if needed. Cover LED indicator lights with tape.` },
            { title: 'White noise machine', desc: `Continuous (not waves or music). Volume: ~65 dB (shower level). Place 3-6 feet from crib. Leave running ALL night.` },
            { title: 'Room temperature 68-72°F (20-22°C)', desc: `Slightly cooler is better. ${name} should feel cool to the touch on chest, not warm or sweaty.` },
            { title: isNewborn ? 'Swaddle (arms in)' : 'Sleep sack', desc: isNewborn ? `Swaddling prevents the Moro startle reflex from waking ${name}. Stop when showing signs of rolling (~3-4 months).` : `Use an age-appropriate sleep sack. It's the wearable blanket that's safe for crib sleep.` },
            { title: 'Empty crib', desc: `Nothing in the crib except a fitted sheet. No blankets, pillows, bumpers, stuffed animals, or positioners.` },
            { title: 'Red nightlight for feeds', desc: `Red/orange light doesn't suppress melatonin like white or blue light. Keep your phone on night mode too.` }
        ],

        emergencyCards: [
            { title: `😭 ${name} is SCREAMING`, action: `Pick up immediately. Hold close, shush loudly near ear (match their volume). Rock or bounce. Once calm (1-3 min), attempt feed. After feed, back in crib with hand on chest.` },
            { title: '😤 Fussing but not screaming', action: `Wait 3 minutes. Hand on chest, firm rhythmic patting, loud shushing. If escalates after 3 min → pick up. If settles → remove hand slowly after 2 min.` },
            { title: '👀 Awake but quiet/happy', action: `Do NOT go in. They may be practicing self-settling. Wait 10 minutes. If still awake after 10 min, offer a feed. If fussing starts, wait 3 more minutes.` },
            { title: '🤢 Spit up / diaper blowout', action: `Handle efficiently: red nightlight only, no talking, no eye contact. Clean up, re-swaddle, back down. Resume settling protocol.` },
            { title: '⏰ It\'s 5 AM and awake', action: `Treat as night. Dark room, boring, offer feed. Try to resettle. Even if awake, keep in dark until 6:00 AM — do NOT start the day early.` },
            { title: '💀 I\'ve been up for 2 hours', action: `It's OK. Cap the struggle at 1 hour of trying. If still awake, do whatever works to get them back to sleep. One bad night doesn't erase your progress.` }
        ],

        caregiverSheet: {
            schedule: [
                `Wake windows: ${isNewborn ? '60-75' : '90-150'} minutes between naps`,
                'Watch for: yawning, red eyebrows, looking away, staring into space',
                `Naps per day: ${isNewborn ? '4-5' : '2-3'}`,
                'Bedtime: 6:30 PM (±15 min)',
                'Do NOT start the day before 6:00 AM'
            ],
            howToSettle: [
                isNewborn ? 'Swaddle firmly (arms in)' : 'Put in sleep sack',
                'White noise ON — leave running',
                'Room DARK — close all curtains',
                'Place on back, hand on chest',
                'Gentle shushing and rhythmic patting',
                'Stay until calm, then slowly leave'
            ],
            doNot: [
                `Don't let ${name} stay awake longer than ${isNewborn ? '75' : '150'} minutes`,
                'Don\'t use screens or TV to calm',
                isNewborn ? 'Don\'t skip the swaddle or white noise' : 'Don\'t skip the white noise',
                'Don\'t keep lights on during naps',
                'Don\'t wake from naps unless past 2 hours',
                'Don\'t start the day before 6:00 AM'
            ],
            ifCrying: [
                'Check: hungry? (feed every 2.5-3 hrs)',
                'Check: overtired? (put down NOW)',
                'Check: dirty diaper?',
                'Check: too hot or cold? (feel chest)',
                'If all OK: hold, bounce, shush — it\'s OK',
                'Contact parent if unsure — never hesitate'
            ]
        },

        regressions: [
            { age: `📍 NOW — ${ageLabel}`, title: 'Current Phase', desc: `This is where ${name} is right now. The plan you have is built for this exact stage — trust the process and stay consistent.`, isCurrent: true },
            { age: '~3-4 Months', title: 'The 4-Month Sleep Regression', desc: `Sleep cycles permanently mature. More wake-ups as ${name} transitions between cycles. Action: regenerate schedule. Transition from swaddle to sleep sack.`, isCurrent: false },
            { age: '~8-10 Months', title: 'Separation Anxiety + Mobility', desc: 'Learning to crawl/pull up + object permanence = sleep disruption. Standing in crib is common. Action: practice "sit back down" during the day. Keep routine consistent (2-4 weeks).', isCurrent: false },
            { age: '~12 Months', title: 'Nap Transition Fake-Out', desc: "May start refusing second nap — don't drop it yet (most aren't ready until 14-18 months). Cap Nap 1 at 90 min. Action: regenerate schedule for 12-month wake windows.", isCurrent: false },
            { age: '~18 Months', title: 'Toddler Sleep Regression', desc: 'Language explosion + boundary testing + molars = disruption. Stay firm on routine. No new sleep crutches. Passes in 2-6 weeks.', isCurrent: false }
        ],

        travel: [
            { title: `✈️ Flying with ${name}`, body: `Book during a nap window if possible. Feed during takeoff and landing (swallowing helps ear pressure). Bring swaddle and portable white noise. Time zones 1-2 hrs: shift cold turkey. 3+ hrs: shift bedtime by 30 min/day. Return home: go back to normal schedule immediately, expect 2-3 rough nights.` },
            { title: '🏨 Hotels / Airbnbs', body: `Bring: portable white noise, travel blackout blinds (SlumberPod is popular), sleep sack, familiar crib sheet. Request pack-n-play. Do the exact bedtime routine in the same order — the routine is the cue, not the location. First night in a new place is always hardest.` },
            { title: '🎄 Holidays / Schedule Chaos', body: `Protect bedtime above all else. Naps can flex but bedtime stays within 30 min of normal. It's OK to hold for naps during family events — one day of contact naps won't ruin progress. The 80/20 rule: follow the plan 80% of the time, keep 80% of progress.` },
            { title: `🤒 When ${name} Is Sick`, body: `Throw the schedule out. Do whatever keeps them comfortable — hold for naps, extra feeds, all OK when sick. Once recovered: go back to the plan on day 1 of feeling better. Expect 2-3 nights of re-training. If illness lasted 5+ days, consider regenerating the schedule.` }
        ],

        milestones: [
            { age: `📍 ${ageLabel} (now)`, naps: isNewborn ? '4-5' : '2-3', wakeWindows: isNewborn ? '60-75 min' : '2-3 hrs', nightSleep: '10-12 hrs', nightFeeds: isNewborn ? '2-3' : '0-1', isCurrent: true },
            { age: '3 months', naps: '3-4', wakeWindows: '75-90 min', nightSleep: '10-12 hrs', nightFeeds: '2', isCurrent: false },
            { age: '4-5 months', naps: '3', wakeWindows: '1.5-2.25 hrs', nightSleep: '11-12 hrs', nightFeeds: '1-2', isCurrent: false },
            { age: '6-8 months', naps: '2', wakeWindows: '2.5-3 hrs', nightSleep: '11-12 hrs', nightFeeds: '0-1', isCurrent: false },
            { age: '9-14 months', naps: '2', wakeWindows: '3-3.75 hrs', nightSleep: '11-12 hrs', nightFeeds: '0', isCurrent: false },
            { age: '15-24 months', naps: '1', wakeWindows: '4.5-5.5 hrs', nightSleep: '11-12 hrs', nightFeeds: '0', isCurrent: false }
        ]
    };
}

module.exports = {
    generatePlan,
    getStats: () => ({ fallbackUsageCount, apiKeyConfigured: !!OPENAI_API_KEY })
};
