# Flowmodoro

A productivity timer based on the Flowmodoro method, designed with cognitive psychology principles to maximize flow state and minimize anxiety.

---

## Description and Purpose

Flowmodoro is a web application that implements the Flowmodoro productivity method, a variant of the traditional Pomodoro technique that respects your natural work rhythm. Unlike Pomodoro which forces you to work in fixed 25-minute blocks, Flowmodoro allows you to work until you naturally need a break, rewarding you with proportional rest time based on your effort.

### Why Flowmodoro?

- Respects your Flow: Does not interrupt your concentration with arbitrary alarms
- Rewards Effort: The more you work, the more rest you earn (5:1 ratio)
- Reduces Anxiety: Minimalist design hides seconds to avoid time obsession
- Encourages Honesty: The registration system makes you aware of your real productivity

### Design Philosophy

This project was built following Psychology-First Design principles:

1. Anxiety-Free Timer: Seconds are hidden in work mode so you "lose track of time"
2. Neutral Copywriting: Buttons use positive language ("Register Break" vs "Break Flow")
3. Visual Hierarchy: Only important elements are prominent (the minute counter)
4. Behavioral Clarity: Destructive actions are clearly marked (e.g., "Skip Break" loses time)

### Scientific Foundation: Cognitive Limits of Deep Work

Research in cognitive psychology has established that the human brain has a finite capacity for sustained deep learning and focused work. Studies indicate that the maximum effective duration for genuine deep learning is approximately 4-6 hours per day.

Key findings:

- Deliberate Practice Limit: Anders Ericsson's research on expert performance demonstrates that even elite performers (musicians, athletes, chess players) rarely exceed 4-5 hours of deliberate, focused practice per day. [Read the full study](<https://graphics8.nytimes.com/images/blogs/freakonomics/pdf/DeliberatePractice(PsychologicalReview).pdf>)

- Cognitive Resource Depletion: The prefrontal cortex, responsible for executive functions like focus and decision-making, experiences metabolic fatigue after prolonged use. This manifests as decreased performance, increased error rates, and mental exhaustion.

- Diminishing Returns: Beyond the 4-6 hour threshold, additional "work" time yields progressively lower quality output. What feels like productivity is often shallow work or pseudo-productivity.

Flowmodoro respects these biological constraints by:

1. Encouraging natural work sessions rather than forcing arbitrary time blocks
2. Providing proportional rest to prevent cognitive resource depletion
3. Making users aware of their actual productive time through the Daily Total metric
4. Discouraging marathon sessions through the pause warning system

The 5:1 work-to-break ratio is designed to sustain deep work capacity throughout the day without exceeding the cognitive budget. A typical Flowmodoro day might consist of 4-6 focused sessions totaling 4-5 hours of genuine deep work, with adequate recovery time between sessions.

---

## Business Rules

### Application States (State Machine)

The application operates under a strict state model:

```
IDLE → FLOW → BREAK → IDLE (cycle)
```

#### State: IDLE (Inactive)

Entry Condition: App startup, after finishing/skipping break

Behavior:

- Session timer at 00
- Visible button: START FLOW or RESUME (if there is paused time)

Transition: Click on START FLOW → FLOW

#### State: FLOW (Work)

Entry Condition: User starts or resumes work

Behavior:

- Timer counts UP (ascending)
- Shows only minutes (no seconds, to reduce anxiety)
- Visible buttons: PAUSE, REGISTER BREAK

Implicit Rule: Time is NOT saved until explicitly registered

Transition:

- Click on PAUSE → IDLE (time is maintained, can resume)
- Click on REGISTER BREAK → Atomic Transaction → BREAK

#### State: BREAK (Rest)

Entry Condition: User registers break after working

Behavior:

- Timer counts DOWN (descending) from break bank
- Shows standard MM:SS format (both visible to generate urgency)
- Visible button: SKIP BREAK (with loss warning)

Strict Rule: If user skips break, remaining time IS LOST (not saved)

Transition:

- Click on SKIP BREAK → IDLE
- Bank reaches 00:00 → IDLE (automatic, with notification)

---

### Atomic Transaction: "Register Break"

When the user clicks REGISTER BREAK, an atomic transaction occurs (all or nothing):

```typescript
1. STOP: Stop work timer
2. CALCULATE: earnedTime = Math.floor(sessionElapsed / 5)
3. SAVE:
   - dailyTotal += sessionElapsed
   - history.push({ duration: sessionElapsed, timestamp: now })
4. TRANSFER: breakBank += earnedTime
5. RESET: sessionElapsed = 0
6. TRANSITION: mode = 'break'
7. START: Start break countdown
```

Business Rule: This transaction is irreversible. Once registered, you cannot "undo" the save.

---

### Break Ratio (5:1)

Explicit Rule: For every 5 minutes of work, you earn 1 minute of break.

Implementation:

```typescript
const breakRatio = 5;
const earnedBreak = Math.floor(sessionElapsed / breakRatio);
```

Examples:

- 50 min of work → 10 min of break
- 25 min of work → 5 min of break
- 4 min of work → 0 min of break (does not reach minimum)

Implicit Rule: Break time accumulates. If you had 2 min in the bank and earn 10 min more, you now have 12 min.

---

### History and Daily Total

#### Daily Total

Definition: Sum of all registered sessions in the day

Calculation: `dailyTotal = Σ history[i].duration`

Rule: Only registered time counts, not paused time

Persistence: Resets the next day (currently in memory, does not persist)

#### Session History

Purpose: Visualize the "velocity" or "pace" of the day

Format: Chips with duration in minutes (e.g., 45m, 30m)

Display Limit: Only the last 5 sessions (to avoid visual noise)

Order: Most recent first (.slice(-5).reverse())

UX Rule: If history grows beyond 5 sessions, container has automatic scroll (max-h-20 overflow-y-auto)

---

### Timing Mechanism

Critical Technical Rule: Time is calculated using Date.now() deltas, NOT with setInterval.

Reason: Browsers "sleep" inactive tabs, making setInterval unreliable.

Implementation:

```typescript
// FLOW Mode (Counting UP)
const tick = () => {
  const now = Date.now();
  sessionElapsed = now - startTime; // Delta calculation
  requestAnimationFrame(tick);
};

// BREAK Mode (Counting DOWN)
const tick = () => {
  const now = Date.now();
  const delta = now - lastTickTime;
  breakBank = Math.max(0, breakBank - delta);
  lastTickTime = now;
  requestAnimationFrame(tick);
};
```

Implicit Rule: Use requestAnimationFrame instead of setInterval for better precision and performance.

---

### Long Pauses (Edge Case)

Recommended Behavioral Rule (currently only warning):

If you pause for more than 15 minutes, consider registering the session. Long pauses break flow.

Psychological Reason: A 2-hour pause is not a "pause", it is the end of the session. Resuming after so long generates a "cold session" that does not reflect continuous work.

Future Implementation (V2): Auto-register sessions paused for more than 15 min.

---

### Display Rules (UI/UX)

#### FLOW Mode (Work)

Timer: Shows only minutes (e.g., 05, 45)

Seconds: Completely hidden (not dimmed, removed from DOM)

Reason: Prevent peripheral vision from catching constant movement

#### BREAK Mode (Rest)

Timer: Shows standard MM:SS format (e.g., 01:57)

Reason: Generate urgency to return to work

Animation: animate-pulse on numbers to emphasize countdown

#### Buttons

Neutral Copywriting:

- Avoid: "Break Flow"
- Use: "Register Break"

Explicit Warnings:

- "Skip Break" → "(Remaining time is lost)"

---

## Technical Documentation

### Technology Stack

- Frontend: Vue 3 (Composition API) + TypeScript
- Styling: Tailwind CSS v4 (CSS-first approach)
- Build Tool: Vite
- State Management: Composable (useFlowmodoro.ts)

### Project Structure

```
src/
├── composables/
│   └── useFlowmodoro.ts    # Business logic (State Machine)
├── App.vue                  # Main UI
├── main.ts                  # Entry point
└── style.css                # Tailwind imports
```

### Composable: useFlowmodoro.ts

Responsibilities:

1. Manage application state (mode, sessionElapsed, breakBank)
2. Implement timing mechanism (Date.now() deltas)
3. Execute atomic "Register Break" transaction
4. Calculate Daily Total and maintain history

Public API:

```typescript
{
  // State
  mode: Ref<'idle' | 'flow' | 'break'>,
  sessionElapsed: Ref<number>,      // ms
  breakBank: Ref<number>,            // ms
  dailyTotal: ComputedRef<number>,   // ms
  history: Ref<Session[]>,
  isRunning: ComputedRef<boolean>,

  // Actions
  startFlow: () => void,
  stopFlowAndBank: () => void,       // Atomic transaction
  stopBreak: () => void,
  pause: () => void,

  // Utilities
  formatTime: (ms: number) => { minutes: string, seconds: string },
  formatHours: (ms: number) => string,

  // Dev Only
  addFiveMinutes: () => void         // [DEV] Testing helper
}
```

### Installation and Development

```bash
# Install dependencies
npm install

# Development (hot-reload)
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

### Environment Variables

Currently no environment variables are used. Everything is hardcoded for simplicity.

---

## Design Principles Applied

### SOLID Principles

Single Responsibility: useFlowmodoro.ts only handles timing logic, App.vue only handles UI

Open/Closed: Break ratio (breakRatio = 5) is configurable without modifying core logic

### Cognitive Load Reduction

No God Objects: Composable exposes only what is necessary

Explicit Typing: Strict TypeScript to avoid runtime errors

Null Coalescing: Use of ?? for clean default values

### YAGNI (You Aren't Gonna Need It)

No localStorage persistence (not yet necessary)

No authentication (single-user app)

No ratio configuration (5:1 is the standard)

---

## Roadmap (V2)

- Auto-kill sessions paused for more than 15 min
- Persistence in localStorage (Daily Total, History)
- Browser notifications when break ends
- Configurable alarm audio
- Weekly/monthly statistics
- Export history to CSV

---

## License

MIT License - See LICENSE for more details.

---

## Author

StevenU21  
GitHub: https://github.com/StevenU21/Flowmodoro

---

## Acknowledgments

Inspired by the Flowmodoro method and built with feedback from psychological analysis and behavioral design.
