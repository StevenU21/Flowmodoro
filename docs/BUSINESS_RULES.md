# Business Rules & Design Philosophy

## Design Philosophy

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

## Application States (State Machine)

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

## Core Mechanics

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

### Long Pauses (Edge Case)

Recommended Behavioral Rule (currently only warning):

If you pause for more than 15 minutes, consider registering the session. Long pauses break flow.

Psychological Reason: A 2-hour pause is not a "pause", it is the end of the session. Resuming after so long generates a "cold session" that does not reflect continuous work.

Future Implementation (V2): Auto-register sessions paused for more than 15 min.
