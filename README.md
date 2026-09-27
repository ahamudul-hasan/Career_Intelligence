<div align="center">

# 🧭 CS Career Intelligence Platform

**An AI-powered platform that analyzes real job postings, extracts in-demand skills, compares them against your own, and generates a personalized roadmap for any CS career.**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](#)
[![Flask](https://img.shields.io/badge/Flask-Backend-000000?logo=flask&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?logo=react&logoColor=black)](#)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)](#)
[![LangChain](https://img.shields.io/badge/LangChain-AI%20Orchestration-1C3C3C)](#)
[![Gemini](https://img.shields.io/badge/Gemini-LLM-8E75B2?logo=googlegemini&logoColor=white)](#)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Supported Career Paths](#-supported-career-paths)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [AI Pipeline](#-ai-pipeline)
- [Job Data Sources](#-job-data-sources)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Example Workflow](#-example-workflow)
- [Limitations](#-limitations)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌐 Overview

**CS Career Intelligence Platform** is a full-stack, AI-powered web application built for Computer Science students and early-career developers. Instead of relying on generic, often outdated online roadmaps, the platform analyzes **current job postings** for a chosen career path, extracts what employers are actually asking for, compares that against your own skills, and generates a **personalized, evidence-based roadmap**.

> "Choose the CS career you want. Analyze what employers currently ask for. Compare that with your skills. Then generate a personalized roadmap to close your skill gaps."

The platform is **career-agnostic** — the same pipeline powers Software Engineer, Backend Developer, AI Engineer, DevOps Engineer, Cybersecurity Engineer, and more, simply by swapping the target career and job dataset.

---

## ❓ Problem Statement

A student searching "AI Engineer roadmap" or "Backend Developer roadmap" online finds hundreds of conflicting, generic guides that:

- Aren't grounded in real, current job market data
- Go stale as technologies and employer expectations shift
- Don't account for the student's *existing* skills
- Recommend the same path to every learner, regardless of where they're starting from

## ✅ Solution

The platform replaces guesswork with a **data-driven pipeline**:

```
Job Market → Extract Requirements → Calculate Skill Demand
→ Compare with User Profile → Identify Skill Gaps → Generate Personalized Roadmap
```

Every statistic shown to the user (skill frequency, percentages, gap severity) is **calculated deterministically from real data** — never invented by the LLM. The LLM is used only where it adds value: extraction, classification, and generating personalized explanations, roadmaps, and project ideas.

---

## 🎯 Supported Career Paths

The career taxonomy is **database-driven and extensible** — new roles can be added without touching the core architecture.

| Category | Example Roles |
|---|---|
| **Software Development** | Software Engineer, Backend Developer, Frontend Developer, Full Stack Developer, Mobile Developer |
| **AI / ML** | AI Engineer, ML Engineer, LLM Engineer, Generative AI Engineer, MLOps Engineer |
| **Data** | Data Scientist, Data Analyst, Data Engineer, Analytics Engineer |
| **Infrastructure** | DevOps Engineer, Cloud Engineer, SRE, Platform Engineer, GPU/CUDA Engineer |
| **Security** | Cybersecurity Engineer, Application Security Engineer, SOC Analyst |
| **Quality** | QA Engineer, SDET, Automation Test Engineer |

---

## ✨ Features

- 🔍 **Live job market analysis** — pulls real postings for a chosen career, location, and experience level
- 🧹 **Automated cleaning & deduplication** of raw job descriptions
- 🤖 **AI-powered skill extraction** (Gemini via LangChain) with category, importance, and confidence
- 🧬 **Skill normalization** — collapses aliases like `Postgres` / `PostgreSQL` / `PostgreSQL DB` into one canonical skill
- 📊 **Deterministic market statistics** — skill frequency and percentages calculated in Python/SQL, never guessed
- 🧑‍💻 **Personal skill profile** with proficiency tracking (None → Expert)
- 🎯 **Skill gap engine** — High / Medium / Low priority gaps based on configurable thresholds
- 🗺️ **Personalized, phase-based roadmap generation**
- 🛠️ **Career-specific project recommendations** tied to each skill gap
- 🧾 **Job-specific matching** — see exactly which requirements you meet for a single posting
- 📈 **Full data transparency** — every analysis shows its sources, job count, and collection date

---

## 🏗️ Architecture

```
                         USER
                           │
                           ▼
                ┌─────────────────────┐
                │ React + TypeScript  │
                │ Tailwind CSS        │
                └──────────┬──────────┘
                           │  REST
                           ▼
                ┌─────────────────────┐
                │     Flask API       │
                └──────────┬──────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   Job Providers      LangChain          MySQL
   (Adzuna, etc.)      + Gemini
          │                │
          ▼                ▼
      Job Data       Skill Extraction
                           │
                           ▼
                    Market Analysis
                           │
                           ▼
                    Skill Gap Engine
                           │
                           ▼
                   Roadmap Generator
                           │
                           ▼
                    Project Generator
```

**Design principle:** deterministic logic (counts, percentages, gap scoring) always lives in Python/SQL. The LLM is reserved for extraction, classification, normalization edge cases, and generative text — it never calculates or invents statistics.

---

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Recharts |
| **Backend** | Python, Flask, Flask-CORS, SQLAlchemy, Flask-Migrate (Alembic), Pydantic |
| **Database** | MySQL + SQLAlchemy ORM |
| **AI Orchestration** | LangChain |
| **LLM** | Google **Gemini** (`langchain-google-genai`) |
| **Job Data** | Adzuna API (+ pluggable providers: Jooble, manual entry, file upload) |

---

## 🗄️ Database Schema

Raw, hand-maintained SQL lives in `database/` (schema reference, seeds, and debug queries), while `backend/migrations/` (Alembic) owns the authoritative, versioned schema.

```
users              career_roles         jobs
skills             job_skills           user_skills
analyses           roadmap_phases       roadmap_items
projects           roadmap_projects
```

<details>
<summary><strong>Expand core table overview</strong></summary>

| Table | Purpose |
|---|---|
| `users` | Account info (auth optional for MVP) |
| `career_roles` | Database-driven career taxonomy |
| `jobs` | Collected postings (title, company, description, source, etc.) |
| `skills` | Canonical, normalized skill list |
| `job_skills` | Skill ↔ job mapping with importance & confidence |
| `user_skills` | User's self-reported skills & proficiency (0–4) |
| `analyses` | A single market-analysis run (career, location, experience, job count) |
| `roadmap_phases` / `roadmap_items` | Generated roadmap structure |
| `projects` / `roadmap_projects` | Recommended projects tied to roadmap items |

</details>

```
database/
├── schema/    → schema.sql (full CREATE TABLE statements, mirrors Alembic migrations)
├── seeds/     → career_roles.sql, skills_aliases.sql
└── queries/   → market_analysis.sql (reference aggregation queries)
```

---

## 🤖 AI Pipeline

```
Job Description
      │
      ▼
Skill Extraction (Gemini + LangChain, structured output)
      │
      ▼
Skill Normalization (alias dictionary → LLM fallback only when needed)
      │
      ▼
Market Analysis (pure Python/SQL — frequencies & percentages)
      │
      ▼
Skill Gap Calculation (deterministic, configurable thresholds)
      │
      ▼
Roadmap Generation (Gemini + LangChain, fed real statistics — never invents numbers)
      │
      ▼
Project Recommendation (Gemini + LangChain, one project per major skill gap)
```

All prompts are centralized in `backend/app/ai/prompts.py` — never embedded inline in route handlers.

---

## 🌍 Job Data Sources

Job data is fetched through a **provider abstraction**, so sources can be swapped without touching the analysis pipeline:

```
JobDataProvider (base)
   ├── AdzunaProvider   → authorized job search API
   ├── JoobleProvider   → authorized job search API
   ├── ManualProvider   → user-pasted job descriptions
   └── FileProvider     → uploaded TXT/PDF job descriptions
```

> Unauthorized scraping (e.g. LinkedIn) is explicitly out of scope.

---

## 📁 Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── ai/            # LLM prompts, extractor, roadmap & project generators
│   │   ├── config/        # settings, gap thresholds
│   │   ├── models/        # SQLAlchemy models
│   │   ├── providers/     # job data provider implementations
│   │   ├── routes/        # Flask blueprints
│   │   ├── schemas/       # Pydantic validation schemas
│   │   ├── services/      # business logic (analysis, gaps, roadmap)
│   │   └── utils/         # text cleaning, normalization, validators
│   ├── migrations/        # Alembic migrations
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # career/job/skill/roadmap UI components
│   │   ├── pages/         # Home, CareerSelection, MarketAnalysis, Roadmap, etc.
│   │   ├── services/      # API clients
│   │   ├── types/         # TypeScript types
│   │   └── hooks/         # data-fetching hooks
│   └── package.json
├── database/
│   ├── schema/
│   ├── seeds/
│   └── queries/
└── README.md
```

---

## 📡 API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/careers` | List all careers |
| `GET` | `/api/careers/<id>` | Career detail |
| `GET` | `/api/jobs` | List collected jobs |
| `POST` | `/api/jobs/search` | Fetch new jobs from a provider |
| `POST` | `/api/jobs/import` | Manually import a job description |
| `GET` | `/api/jobs/<id>` | Job detail |
| `GET` | `/api/skills` | List canonical skills |
| `GET` | `/api/skills/top` | Top skills by market frequency |
| `GET /PUT` | `/api/profile` | View/update user profile |
| `GET /POST /PUT /DELETE` | `/api/profile/skills[/<id>]` | Manage user skill list |
| `POST` | `/api/analysis` | Run a market analysis |
| `GET` | `/api/analysis/<id>` | Analysis detail |
| `GET` | `/api/analysis/<id>/skills` | Market skill breakdown |
| `GET` | `/api/analysis/<id>/gaps` | Skill gap results |
| `POST` | `/api/roadmap/generate` | Generate a personalized roadmap |
| `GET` | `/api/roadmap/<id>` | Roadmap detail |
| `GET` | `/api/projects` | List recommended projects |

---

## ⚙️ Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/cs-career-intelligence-platform.git
cd cs-career-intelligence-platform

# 2. Backend setup
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # fill in your values
flask db upgrade                # run migrations
python run.py

# 3. Frontend setup (in a new terminal)
cd frontend
npm install
npm run dev

# 4. Database
# Create the MySQL database referenced in your .env, then optionally load
# reference SQL from database/schema/ and database/seeds/
```

---

## 🔐 Environment Variables

```env
FLASK_ENV=development

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=cs_career
MYSQL_USER=root
MYSQL_PASSWORD=

GEMINI_API_KEY=

ADZUNA_APP_ID=
ADZUNA_APP_KEY=

JOOBLE_API_KEY=
```

> ⚠️ Never commit `.env`. Only `.env.example` (with empty values) should be tracked in Git.

---

## 🧪 Example Workflow

```text
Career:        Backend Developer
Location:      United States
Experience:    Entry Level
Jobs analyzed: 30

Market Analysis
Python       73.3%
SQL          70.0%
REST APIs    63.3%
Docker       53.3%
AWS          43.3%

Your Skills
Python       Advanced
SQL          Intermediate
Docker       Beginner
AWS          None

Skill Gaps
🔴 AWS       (high demand, no experience)
🟠 Docker    (high demand, beginner)
🟢 Python    (well covered)

Personalized Roadmap
Phase 1 → Backend Fundamentals
Phase 2 → Databases
Phase 3 → Docker & Deployment
Phase 4 → Cloud (AWS)
Phase 5 → Portfolio Projects
```

---

## ⚠️ Limitations

- Market statistics reflect **only the jobs collected in a given run** — not the entire global job market.
- Skill extraction quality depends on job description quality and LLM accuracy; always spot-check extractions.
- The platform does **not** predict hiring likelihood — job matching only shows requirement overlap.
- Resume and GitHub analysis are not part of the MVP (see [Future Roadmap](#-future-roadmap)).

---

