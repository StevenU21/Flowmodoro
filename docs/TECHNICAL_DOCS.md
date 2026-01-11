# Technical Documentation

## Technology Stack

- Frontend: Vue 3 (Composition API) + TypeScript
- Styling: Tailwind CSS v4 (CSS-first approach)
- Build Tool: Vite
- State Management: Composable (useFlowmodoro.ts)

---

## Project Structure

```
src/
├── components/          # Atomic components
│   ├── AppFooter.vue
│   ├── AppHeader.vue
│   ├── BreakBankDisplay.vue
│   ├── ControlButtons.vue
│   ├── InfoModal.vue
│   ├── SessionHistory.vue
│   └── TimerDisplay.vue
├── composables/
│   └── useFlowmodoro.ts # Business logic (State Machine)
├── App.vue              # Main Layout
├── main.ts              # Entry point
└── style.css            # Tailwind imports
```

---

## Timing Mechanism

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

## Composable API: useFlowmodoro.ts

Responsibilities:

1. Manage application state (FlowMode Enum, sessionElapsed, breakBank)
2. Implement timing mechanism (Date.now() deltas)
3. Execute atomic "Register Break" transaction
4. Calculate Daily Total and maintain history

Public API:

```typescript
{
  // State
  mode: Ref<FlowMode>,                  // Enum: IDLE, FLOW, BREAK
  sessionElapsed: Ref<number>,          // ms
  breakBank: Ref<number>,               // ms
  dailyTotal: ComputedRef<number>,      // ms
  history: Ref<Session[]>,
  isRunning: ComputedRef<boolean>,

  // Actions
  startFlow: () => void,
  stopFlowAndBank: () => void,          // Atomic transaction
  stopBreak: () => void,
  pause: () => void,

  // Utilities
  formatTime: (ms: number) => { minutes: string, seconds: string },
  formatHours: (ms: number) => string,

  // Dev Only
  addFiveMinutes: () => void,           // [DEV] Testing helper

  // Type Export
  FlowMode                              // Enum Access
}
```

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
