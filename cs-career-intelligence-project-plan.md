# CS Career Intelligence Platform — Step-by-Step Project Plan

A practical, phase-by-phase build guide. Follow the phases in order — each one produces a working, testable slice of the system before you move to the next.

---

## Phase 0 — Before You Write Code

1. Create the repo with three top-level folders: `backend/`, `frontend/`, and `database/`.
2. Decide on your job data source for MVP (pick **one**: Adzuna API is the easiest to get approved for). Sign up and get API keys now so you're not blocked later.
3. You're using the **Gemini API** as your LLM — install `langchain-google-genai` and get your `GEMINI_API_KEY` ready. All LangChain LLM calls in this plan (extraction, normalization, roadmap, project recommendation) should go through `ChatGoogleGenerativeAI` instead of Claude/OpenAI.
4. Install MySQL locally (or use Docker for MySQL) and confirm you can connect with a client.
5. Create `.env.example` with placeholders for every variable listed in the prompt (Section 59), but replace `LLM_API_KEY` with `GEMINI_API_KEY`. Never commit `.env`.

**Done when:** you can connect to MySQL, hit the job API with a test script, and hit the LLM API with a test script.

---

## Phase 1 — Project Skeleton (Sections 34–35)
1. **Backend**: `flask`, `flask-cors`, `sqlalchemy`, `flask-migrate`, `python-dotenv`, `pydantic`, `langchain-google-genai`. Scaffold the folder structure exactly as listed in Section 34 (empty files are fine for now).
2. **Frontend**: `npm create vite@latest frontend -- --template react-ts`, then add Tailwind, React Router, Axios, Recharts.
3. **Database**: create a `database/` folder at the repo root (sibling to `backend/` and `frontend/`) to hold raw SQL — see the structure below. `flask-migrate`/Alembic still owns your actual schema migrations inside `backend/migrations/`; `database/` is for hand-written/reference SQL and seed data.

   ```text
   database/
   │
   ├── schema/
   │   └── schema.sql          # full CREATE TABLE statements (Sections 22–33), kept in sync with migrations
   │
   ├── seeds/
   │   ├── career_roles.sql    # initial career taxonomy (Section 4)
   │   └── skills_aliases.sql  # optional: seed canonical skills/aliases
   │
   ├── queries/
   │   └── market_analysis.sql # reference/debug queries for skill frequency & percentage calcs (Section 49)
   │
   └── README.md                # how schema.sql relates to Alembic migrations, how to (re)seed locally
   ```
4. Build one endpoint: `GET /api/health` returning `{"status": "ok"}`.
5. Build one frontend page that calls `/api/health` and displays the result.

**Done when:** React → Flask round-trip works end-to-end, and `database/schema/schema.sql` exists (even as a stub) alongside your first Alembic migration.

---

## Phase 2 — Career Taxonomy (Sections 4, 24, 38)

1. Create the `career_roles` table/model (id, name, category, description). Add the matching `CREATE TABLE` to `database/schema/schema.sql`.
2. Write the seed data as `database/seeds/career_roles.sql` (initial career list from Section 4: Software Dev, AI/ML, Data, Infrastructure, Security, Quality), and load it via your seed script.
3. Build `GET /api/careers` and `GET /api/careers/<id>`.
4. Build the **Career Selection** page: categories with clickable career cards, plus a search/filter box.

**Done when:** selecting a career on the frontend stores/returns the correct `career_role_id`.

---

## Phase 3 — Job Data Model & Manual Job Management (Sections 16, 25, 36)

1. Create the `jobs` table (all fields in Section 16/25, nullable where a provider might not supply them).
2. Build CRUD-lite endpoints: `POST /api/jobs/import` (manual/paste-in), `GET /api/jobs`, `GET /api/jobs/<id>`, delete.
3. Build a simple **Jobs** page to view stored jobs and paste in a manual job description for testing (this becomes your `ManualProvider`).

**Done when:** you can manually add a job description and see it listed and opened.

---

## Phase 4 — Job Provider Integration (Sections 15, 17)

1. Build the `JobDataProvider` abstract base class (`providers/base.py`) with a common interface, e.g. `search(career, location, experience, limit) -> List[JobDict]`.
2. Implement **one** concrete provider first: `AdzunaProvider`.
3. Implement `ManualProvider` and `FileProvider` (TXT/PDF upload) using the same interface.
4. Wire up the **Job Search** page (Section 39): career, location, experience, number of jobs, source → calls `POST /api/jobs/search`.
5. Pipeline on the backend: call provider → normalize field names → dedupe (by external_id/URL/title+company) → bulk insert into MySQL.

**Done when:** selecting "Backend Developer, USA, Entry Level, 30 jobs" actually populates 20–30 rows in `jobs`.

---

## Phase 5 — Job Cleaning (Section 18)

1. Build `utils/text_cleaner.py` with `clean_html()`, `normalize_whitespace()`, `remove_duplicates()`, `normalize_unicode()`.
2. Run cleaning as a step right after ingestion, before storage or extraction (store the cleaned description, keep raw if useful for debugging).
3. Write `tests/test_jobs.py` cases with messy HTML/whitespace samples to confirm the cleaner behaves.

**Done when:** stored `description` fields are clean, readable text with no HTML tags or junk boilerplate.

---

## Phase 6 — LangChain Skill Extraction (Sections 19, 47)

1. Create `ai/llm.py` (LangChain LLM client wrapper around `ChatGoogleGenerativeAI`, reading `GEMINI_API_KEY` from env) and `ai/prompts.py` (store the Section 47 extraction prompt here, not inline in routes).
2. Create `ai/skill_extractor.py` using LangChain's structured output to enforce the JSON schema from Section 19 (name, category, importance, confidence).
3. Create the `skills` and `job_skills` tables.
4. Build a batch job/endpoint that runs extraction over all cleaned jobs for a career and stores results.
5. Manually sanity-check 5–10 extractions against the raw job text — this is the step most likely to need prompt tuning.

**Done when:** every stored job has a set of extracted skills with category/importance/confidence in the database.

---

## Phase 7 — Skill Normalization (Sections 20, 26)

1. Build `utils/normalization.py`: lowercase, whitespace normalization, then an **alias dictionary** (Python/PostgreSQL/React examples from Section 20).
2. Add a `normalized_name` column on `skills` and dedupe skills onto the canonical name during/after extraction.
3. Only fall back to LLM-based normalization for skills the alias dictionary doesn't catch (keep this optional/off for MVP).
4. Write `tests/test_skill_normalization.py` with the exact alias examples from the prompt.

**Done when:** "Postgres", "PostgreSQL", "PostgreSQL DB" all collapse into a single `skills` row.

---

## Phase 8 — Market Analysis (Deterministic) (Sections 7, 49, 40)

1. Build `services/skill_service.py` (or `analysis_service.py`) with pure Python/SQL aggregation: for a given `career_role_id` + job set, compute `skill_count`, `percentage`, `required_count`, `preferred_count` per skill. **No LLM involved here.** Save the raw aggregation query to `database/queries/market_analysis.sql` for reference/debugging.
2. Build `GET /api/skills/top` and the analysis creation flow (`POST /api/analysis` → stores an `analyses` row with `jobs_analyzed`, `target_location`, `experience_level`, `analysis_date`).
3. Build the **Market Analysis** page: metadata header (career/location/experience/jobs analyzed/sources/date — Section 56) + Recharts bar chart of top skills by percentage, grouped by category.
4. Write `tests/test_market_analysis.py` with a known job/skill fixture to assert exact percentages.

**Done when:** the dashboard shows real, correctly-calculated percentages — never invented numbers.

---

## Phase 9 — User Skill Profile (Sections 8, 28, 41)

1. Create `users` (id, name, email, password_hash — auth can stay unimplemented for now, use a hardcoded/default user id) and `user_skills` (proficiency 0–4 per Section 28) tables.
2. Build `GET/PUT /api/profile`, `GET/POST/PUT/DELETE /api/profile/skills`.
3. Build the **Profile** page: add/remove skill, set proficiency (None → Expert), list current skills.

**Done when:** a user can build and edit a personal skill list with proficiency levels.

---

## Phase 10 — Skill Gap Engine (Sections 9, 50, 42)

1. Implement the deterministic gap algorithm in `services/analysis_service.py`: input = `market_frequency` + `user_proficiency`, output = High/Medium/Low gap, using **configurable thresholds** (put these in `config/settings.py`, not hardcoded inline).
2. Build `GET /api/analysis/<id>/gaps`.
3. Build the **Skill Gap** page: skills grouped into High/Medium/Low priority, each with a short explanation referencing the actual market percentage.
4. Write `tests/test_skill_gap.py` covering the example numbers from Section 9.

**Done when:** two users with different skill profiles against the same market data get visibly different gap results (Section 11 check).

---

## Phase 11 — Personalized Roadmap Generation (Sections 10, 30–33, 48, 43)

1. Create `roadmap_phases`, `roadmap_items`, `projects`, `roadmap_projects` tables.
2. Build `ai/prompts.py` roadmap prompt per Section 48 — feed it target career, market frequencies, user skills/proficiency, gaps, and available time. **Never let the LLM invent statistics** — only pass in numbers you already calculated in Phase 8/10.
3. Build `ai/roadmap_generator.py` (LangChain structured output → phases → items, each item tied to a `skill_id`).
4. Build `POST /api/roadmap/generate` and `GET /api/roadmap/<id>`.
5. Build the **Roadmap** page as a phase timeline (Section 43), each item explaining why it matters + estimated duration + linked project.

**Done when:** running the same pipeline for two different users (or two different careers) produces genuinely different, non-generic roadmaps.

---

## Phase 12 — Project Recommendations (Sections 45, 33)

1. Build `ai/project_recommender.py`: for each major skill gap, generate a project suggestion (title, description, difficulty, skills demonstrated) and link it via `roadmap_projects`.
2. Build `GET /api/projects`.
3. Surface recommended projects inline on the Roadmap page under each phase/item.

**Done when:** every high-priority gap has at least one concrete, career-relevant project attached.

---

## Phase 13 — Job-Specific Matching (Section 44, optional but high-value)

1. On a single job's detail view, compare its extracted `job_skills` against the user's `user_skills`.
2. Show matched / partially matched / missing requirements — explicitly **do not** output a hire/no-hire prediction.

**Done when:** clicking into any stored job shows a clear ✓/✗ requirements breakdown for the current user.

---

## Phase 14 — Error Handling & Data Transparency (Sections 56, 57)

1. Standardize error responses across the API using the `{ "error": "CODE", "message": "..." }` shape.
2. Handle: no jobs found, provider/API failure, rate limits, LLM timeout/invalid output, duplicate jobs, malformed descriptions, file upload errors.
3. Make sure every analysis/market view always displays its transparency header (career, location, experience, job count, sources, collection date).

**Done when:** killing your internet mid-request or feeding a garbage file doesn't crash the app — it shows a clear, structured error.

---

## Phase 15 — Security Pass (Section 58)

1. Confirm all secrets live in `.env`/environment variables, never in frontend code or Git history.
2. Add input validation (Pydantic schemas) on every POST/PUT endpoint.
3. Add file type/size validation for uploads.
4. Lock down CORS to your frontend origin.
5. If you added auth, confirm passwords are hashed (never plaintext).

**Done when:** you can hand the repo to someone else and there's nothing sensitive in it.

---

## Phase 16 — Testing Pass (Section 60)

1. Backend: fill in `test_careers.py`, `test_jobs.py`, `test_skill_extraction.py`, `test_skill_normalization.py`, `test_market_analysis.py`, `test_skill_gap.py`, `test_roadmap.py`.
2. Frontend: at minimum, smoke-test career selection, job search, dashboard rendering, profile editing, gap display, roadmap display, and loading/error states.

**Done when:** `pytest` passes and the core user flow works with no console errors.

---

## Phase 17 — MVP Definition Check (Section 62)

Before calling it done, walk through this exact flow yourself, start to finish, with **no shortcuts**:

```
Select a career → select location → select experience level
→ retrieve 20–30 real jobs → store in MySQL → clean descriptions
→ LangChain extracts skills → skills normalized
→ Python calculates market frequencies → React displays market analysis
→ enter your own skills → system calculates skill gaps
→ LangChain generates a personalized roadmap → projects recommended
→ React displays the final roadmap
```

If every arrow in that chain works with real data (not fixtures), your MVP is done.

---

## Phase 18 — README & Deployment (Sections 67, 18)

1. Write the README covering all 17 points in Section 67 (overview, problem, solution, careers supported, architecture, tech stack, schema, AI pipeline, data sources, API docs, install steps, env vars, screenshots, example workflow, limitations, future roadmap).
2. Add Dockerfiles for backend/frontend + a production config.
3. Deploy (pick one target: Railway/Render for backend+MySQL, Vercel/Netlify for frontend) or document local-only setup if you're not deploying yet.

**Done when:** a stranger can clone the repo, follow your README, and get the app running.

---

## Later / Optional (Do Not Block MVP On These)

- **Resume analysis** (Section 53): PDF upload → text extraction → LLM skill extraction → merge into profile.
- **GitHub analysis** (Section 54): connect GitHub → analyze repos/languages → supplement (not replace) skill evidence.
- **Historical trends** (Section 55): store analyses over time, show skill demand trend charts per career.
- **RAG** (Section 51): embed job descriptions, let users ask natural-language questions about the market with retrieved evidence.
- **LangGraph agent** (Section 52): turn the pipeline (career→jobs→clean→extract→normalize→analyze→gaps→roadmap→projects) into explicit graph nodes once the linear version is stable.

---

## Guardrails to Keep in Mind at Every Phase

- **Never let the LLM invent numbers.** Percentages, counts, and gap classifications are always Python/SQL-calculated; the LLM only explains/generates roadmap text and project ideas from numbers you hand it.
- **Career-agnostic by construction.** If you ever catch yourself writing an `if career == "AI Engineer"` branch, stop — the career taxonomy and job dataset should be the only thing that changes per career, not the code path.
- **Two users, two roadmaps.** Periodically re-run Phase 11 with two very different skill profiles against the same market data — if the roadmaps look the same, something's wrong (Section 11).

---
