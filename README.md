# QuizLive — Realtime Quiz Platform

React + Vite + Tailwind + Supabase quiz platform with admin CRUD, room codes, and live waiting rooms.

## Tech stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 4, React Router 7
- **Backend:** Supabase (Auth, PostgreSQL, Realtime)
- **Deploy:** Vercel (SPA rewrites included)

## Features (Phase 1 & 2)

| Feature | Status |
|---------|--------|
| Admin auth (signup, login, protected routes) | ✅ |
| Quiz CRUD (title, questions, 4 options, timer, reorder) | ✅ |
| Unique room codes + validation | ✅ |
| Participant join (`/join`) | ✅ |
| Live waiting room (participant + admin) | ✅ |
| Admin start quiz (status → active) | ✅ |
| Realtime question sync | ✅ |
| Local timer sync (no per-second Realtime) | ✅ |
| Answer submit + scoring (RPC) | ✅ |
| Live leaderboard + podium | ✅ |

## Project structure

```
src/
├── components/     # UI, quiz (QuizCard, QuestionEditor, …)
├── contexts/       # Auth, Toast
├── hooks/          # useAuth, useParticipants, useSession
├── layouts/
├── pages/
├── services/       # auth, quiz, session, participant
└── utils/          # roomCode, quizHelpers, paths
supabase/
├── schema.sql
└── migrations/phase2_participants.sql
```

## Quick start

### 1. Install & env

```bash
npm install
cp .env.example .env.local
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Supabase **Project Settings → API**.

### 2. Database

Run in Supabase **SQL Editor**, in order:

1. [`supabase/schema.sql`](./supabase/schema.sql) — base tables + RLS
2. [`supabase/migrations/phase2_participants.sql`](./supabase/migrations/phase2_participants.sql) — join policies + Realtime  
3. [`supabase/migrations/phase3_live_quiz.sql`](./supabase/migrations/phase3_live_quiz.sql) — live quiz state, scoring RPC, leaderboard
4. [`supabase/migrations/performance_indexes.sql`](./supabase/migrations/performance_indexes.sql) — **recommended** for faster queries

### 3. Auth

**Authentication → Email** — enable email; disable “Confirm email” for local dev if desired.

### 4. Run

```bash
npm run dev
```

## Usage flows

### Admin: create & host

1. Sign up / log in as admin.
2. **Dashboard → Quizzes → Create quiz** — add questions (4 options, correct answer, timer).
3. On a quiz card, click **Host live** — generates a unique 6-character room code.
4. Share the code; watch participants appear in the waiting room.
5. Click **Start quiz** when ready (requires ≥1 participant). Keep the **host live** tab open — it drives automatic question transitions.

### Participant: join

1. Open **Join quiz** (home or navbar).
2. Enter room code + nickname.
3. Wait in the live participant list until the host starts — you’ll auto-enter `/play/:sessionId`.
4. Answer each question before the timer ends; view reveal, leaderboard, then the final podium.

## Room codes

- 6 characters: `A–Z` and `2–9` (ambiguous chars like `0`/`O` excluded).
- Uniqueness enforced by DB `UNIQUE` on `session_code` + retry logic (up to 12 attempts).
- Validation rejects invalid format, unknown codes, ended sessions, and already-started sessions.

## Key routes

| Path | Description |
|------|-------------|
| `/` | Home |
| `/join` | Participant join form |
| `/waiting/:sessionId` | Participant waiting room |
| `/dashboard` | Admin overview |
| `/dashboard/quizzes` | Quiz list |
| `/dashboard/quizzes/new` | Create quiz |
| `/dashboard/quizzes/:id/edit` | Edit quiz |
| `/dashboard/sessions/:sessionId/waiting` | Admin waiting room |
| `/dashboard/sessions/:sessionId/live` | Admin live host (auto-advance) |
| `/play/:sessionId` | Participant live quiz |
| `/results/:sessionId` | Final podium & standings |

## Services overview

- **`quizService`** — `fetchQuizzes`, `fetchQuizById`, `createQuiz`, `updateQuiz`, `deleteQuiz`
- **`sessionService`** — `createSessionWithRoomCode`, `validateRoomCode`, `startQuizSession`, Realtime session subscription
- **`participantService`** — `joinSession`, `fetchParticipants`, Realtime participant subscription
- **`liveQuizService`** — `startLiveQuiz`, `advanceToQuestion`, `getCurrentQuestion` (RPC)
- **`answerService`** — `submitAnswer` via `submit_answer` RPC
- **`leaderboardService`** — `fetchLeaderboard`, `refreshLeaderboard`

## Timer & scoring (Phase 3)

- **Timer:** `question_started_at` + `time_limit_seconds` on the session; clients compute remaining time locally (250ms tick, not Realtime).
- **Scoring (server RPC):** 10 base points + up to 5 speed bonus for correct answers.
- **Phases:** `question` → `reveal` (3.5s) → `leaderboard` (5s) → next question or `podium`.

## Deploy to Vercel

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables. Framework: **Vite**.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Quiz form stuck loading | Use `/dashboard/quizzes/new` for create; edit URLs must be `/dashboard/quizzes/{uuid}/edit` |
| Join fails | Run `phase2_participants.sql`; room must be in **waiting** status |
| Waiting room not live | Enable Realtime on `participants` and `quiz_sessions` (see migration) |
| Nickname taken | Pick a different nickname in the same room |
| Host creates duplicate rooms | **Host live** reopens an existing waiting room for that quiz when possible |

## Phase 3 notes

- The **admin live page** must stay open during the quiz to orchestrate phase transitions.
- Run all three SQL files in order if setting up a fresh project.

## License

Private — course / project use.
