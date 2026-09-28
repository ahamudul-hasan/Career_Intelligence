<div align="center">

# 🧭 CS Career Intelligence Platform

### *Evidence-Based Career Roadmaps Grounded in Real Job Market Data*

An AI-powered intelligence platform that analyzes live tech job postings, calculates empirical skill demand without LLM hallucinations, identifies individual skill gaps, and generates personalized career roadmaps for CS students and developers.

<br />

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0%2B-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![LangChain](https://img.shields.io/badge/LangChain-0.2%2B-1C3C3C?style=for-the-badge&logo=chainlink&logoColor=white)](https://www.langchain.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-Flash-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<br />

</div>

---

## 📑 Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Solution](#3-solution)
4. [Careers Supported](#4-careers-supported)
5. [System Architecture](#5-system-architecture)
6. [Tech Stack](#6-tech-stack)
7. [Database Schema](#7-database-schema)
8. [AI Pipeline & Structured Intelligence](#8-ai-pipeline--structured-intelligence)
9. [Data Sources & Ingestion](#9-data-sources--ingestion)
10. [REST API Documentation](#10-rest-api-documentation)
11. [Local Installation & Setup](#11-local-installation--setup)
12. [Environment Configuration](#12-environment-configuration)
13. [Visual Highlights & UI Walkthrough](#13-visual-highlights--ui-walkthrough)
14. [End-to-End Example Workflow](#14-end-to-end-example-workflow)
15. [Known Limitations & Edge Cases](#15-known-limitations--edge-cases)
16. [Future Roadmap](#16-future-roadmap)
17. [License & Credits](#17-license--credits)

---

## 1. Overview

The **CS Career Intelligence Platform** eliminates the guesswork in tech career preparation. Rather than relying on static blog posts or generic syllabus lists, the platform grounds its insights in live, empirical market data scraped and queried from real job postings.

It extracts required technologies, normalizes messy synonyms into canonical concepts, calculates exact statistical demand percentages using deterministic Python and SQL algorithms, benchmarks an individual user's skills against employer requirements, and generates milestone-driven learning roadmaps paired with portfolio projects.

---

## 2. Problem Statement

Tech students and early-career software developers face three critical challenges:

1. **Curriculum Lag**: University curricula and bootcamps often lag years behind industry standards, teaching technologies whose market demand is waning while neglecting high-frequency tools.
2. **Conflicting & Subjective Advice**: "Top 10 Tools to Learn in 2026" guides contradict one another, offer subjective opinions, and fail to differentiate between entry-level vs. senior expectations or regional requirements.
3. **LLM Hallucinations in Career Guidance**: Generic generative AI chats freely invent statistics (e.g., claiming "85% of jobs require Rust") without grounding their claims in verifiable data.

---

## 3. Solution

The platform implements an **evidence-based, deterministic pipeline**:

- **Real Market Aggregation**: Ingests 20–30 live job descriptions per query across certified job search providers (Adzuna) or user document uploads.
- **Deterministic Number Guardrail**: Percentages, frequencies, counts, and gap classifications are **100% computed in Python/SQL**. The LLM is strictly prohibited from inventing numerical data.
- **Synonym Normalization**: High-speed hash maps and regex rules collapse duplicate variants (e.g., `PostgreSQL`, `Postgres`, `psql` ➔ `PostgreSQL`).
- **Two Users, Two Roadmaps**: Roadmaps are personalized to each user's unique baseline profile. Two developers targeting the same career will receive visibly distinct milestones reflecting their respective skill gaps.
- **Full Data Transparency**: Every analysis snapshot displays a mandatory Section 56 audit header stating target career, location, experience level, total jobs analyzed, data sources, and collection timestamp.

---

## 4. Careers Supported

The platform provides a database-driven, career-agnostic taxonomy of **25 roles across 6 technical domains**:

```
├── 💻 Software Development
│   ├── Software Engineer
│   ├── Backend Developer
│   ├── Frontend Developer
│   ├── Full Stack Developer
│   └── Mobile Developer
├── 🤖 Artificial Intelligence & Machine Learning
│   ├── AI Engineer
│   ├── ML Engineer
│   ├── LLM Engineer
│   ├── Generative AI Engineer
│   └── MLOps Engineer
├── 📊 Data & Analytics
│   ├── Data Scientist
│   ├── Data Analyst
│   ├── Data Engineer
│   └── Analytics Engineer
├── ☁️ Cloud & DevOps
│   ├── DevOps Engineer
│   ├── Cloud Engineer
│   ├── Site Reliability Engineer (SRE)
│   ├── Platform Engineer
│   └── GPU / CUDA Engineer
├── 🛡️ Cybersecurity
│   ├── Cybersecurity Engineer
│   ├── Application Security Engineer
│   └── SOC Analyst
└── 🧪 Quality Assurance & Testing
    ├── QA Engineer
    ├── SDET (Software Dev Engineer in Test)
    └── Automation Test Engineer
```

---

## 5. System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Frontend)"]
        UI["React 19 + TypeScript + Tailwind CSS v4"]
        RC["Recharts Analytics & Data Transparency Headers"]
        ROUTER["React Router (SPA Navigation)"]
    end

    subgraph Server ["Application Layer (Flask REST API)"]
        API["Flask 3.0 Application & Blueprints"]
        VAL["Pydantic Validation Layer (Request Schemas)"]
        ERR["Global JSON Error Handlers (AppError)"]
        SRV["Business Logic Services (Job, Skill, Analysis, Roadmap)"]
    end

    subgraph Data ["Data & Providers Layer"]
        ADZ["Adzuna Live API Provider"]
        FILE["File Upload Provider (.txt, .md, .json, .csv, .pdf)"]
        CLEAN["Text Cleaner (HTML / Entities / Boilerplate Removal)"]
        NORM["Canonical Skill Normalization Dictionary"]
        MYSQL[("MySQL 8.0 (InnoDB Engine)")]
    end

    subgraph AI ["AI Orchestration Layer"]
        LC["LangChain Engine"]
        GEMINI["Google Gemini 2.5 Flash"]
    end

    UI <-->|HTTP / JSON via Vite Proxy| API
    API --> VAL --> SRV
    API --> ERR
    SRV <-->|SQLAlchemy ORM + PyMySQL| MYSQL
    SRV --> ADZ --> CLEAN --> MYSQL
    SRV --> FILE --> CLEAN --> MYSQL
    SRV <--> NORM
    SRV <--> LC <--> GEMINI
```

---

## 6. Tech Stack

| Component | Technology | Version | Purpose |
|:---|:---|:---|:---|
| **Backend Framework** | Python / Flask | 3.10+ / 3.0+ | Lightweight REST API server and blueprint routing |
| **ORM & Migrations** | SQLAlchemy / Flask-Migrate | 2.0+ / 4.0+ | Object relational mapping and schema version control |
| **Relational Database** | MySQL | 8.0 (InnoDB) | Persistent storage with ACID transactions, foreign keys, and indexes |
| **AI Orchestration** | LangChain / Google Gemini | 0.2+ / Flash | Structured output extraction, roadmap synthesis, and project ideation |
| **Data Validation** | Pydantic | 2.0+ | Strict request payload validation on all POST/PUT routes |
| **Frontend UI** | React / TypeScript | 19.0 / 5.0+ | Modern component architecture, state management, and type safety |
| **Styling & Icons** | Tailwind CSS / Lucide-React | v4.0 / 1.0+ | Clean slate/cyan aesthetic, glassmorphism, responsive design |
| **Visual Charts** | Recharts | 3.0+ | Responsive horizontal frequency bar charts and priority breakdowns |
| **Build & Tooling** | Vite / Docker | 8.0+ / 24+ | Lightning-fast HMR, production bundling, and containerization |

---

## 7. Database Schema

The database consists of **8 relational tables** designed with foreign key constraints, cascading deletes, and optimized indexes:

```mermaid
erDiagram
    CAREER_ROLES ||--o{ JOBS : "categorizes"
    CAREER_ROLES ||--o{ ANALYSES : "evaluates"
    CAREER_ROLES ||--o{ ROADMAPS : "targets"
    JOBS ||--o{ JOB_SKILLS : "contains"
    SKILLS ||--o{ JOB_SKILLS : "referenced_in"
    SKILLS ||--o{ USER_SKILLS : "rated_by"
    USERS ||--o{ USER_SKILLS : "possesses"
    USERS ||--o{ ROADMAPS : "owns"
    ROADMAPS ||--o{ ROADMAP_PHASES : "structured_into"
    ROADMAP_PHASES ||--o{ ROADMAP_ITEMS : "contains"
    ROADMAP_PHASES ||--o| RECOMMENDED_PROJECTS : "reinforces"

    CAREER_ROLES {
        int id PK
        string name UK
        string category
        string description
    }
    JOBS {
        int id PK
        int career_role_id FK
        string title
        string company
        string location
        string experience_level
        string source
        string external_id UK
        text raw_description
        text cleaned_description
        datetime posted_at
    }
    SKILLS {
        int id PK
        string name UK
        string normalized_name UK
        string category
    }
    JOB_SKILLS {
        int id PK
        int job_id FK
        int skill_id FK
        string importance "required | preferred"
        float confidence
    }
    USERS {
        int id PK
        string name
        string email UK
        string password_hash
    }
    USER_SKILLS {
        int id PK
        int user_id FK
        int skill_id FK
        smallint proficiency "0 to 4"
        datetime updated_at
    }
    ANALYSES {
        int id PK
        int career_role_id FK
        string target_location
        string experience_level
        int jobs_analyzed
        string sources
        datetime analysis_date
    }
    ROADMAPS {
        int id PK
        int user_id FK
        int career_role_id FK
        string title
        text summary
    }
```

---

## 8. AI Pipeline & Structured Intelligence

### A. Structured Skill Extraction
Job descriptions are parsed using LangChain's `with_structured_output` backed by Google Gemini. The output strictly validates against Pydantic schemas:
- **`name`**: Extracted skill name.
- **`category`**: Technical, Language, Framework, Database, Cloud, Tool, or Soft Skill.
- **`importance`**: `required` vs. `preferred`.
- **`confidence`**: Float value between 0.0 and 1.0.

### B. Canonical Normalization
Extracted tokens pass through a normalization engine:
1. Strips punctuation, version suffixes (`Python 3.11` ➔ `python`), and excessive spacing.
2. Resolves against a canonical alias table (e.g., `postgres`, `psql`, `postgresql-server` ➔ `PostgreSQL`).
3. Formats canonical display titles (e.g., `react.js` ➔ `React`, `k8s` ➔ `Kubernetes`).

### C. Deterministic Gap Classification
Gap priorities are computed directly in Python/SQL using configurable thresholds:
$$\text{Market Frequency (\%)} = \frac{\text{Postings Demanding Skill}}{\text{Total Postings Analyzed for Role}} \times 100$$

| Gap Priority | Market Demand Frequency | User Proficiency Level | Action Recommended |
|:---|:---|:---|:---|
| **High** | $\ge 40\%$ | $0$ (None) or $1$ (Beginner) | Immediate Phase 1 study required |
| **Medium** | $20\% \le f < 40\%$ | $0$ or $1$ | Secondary Phase 2 focus |
| **Low / Optional** | $< 20\%$ or User Proficiency $\ge 2$ | Any | Elective or already mastered |

---

## 9. Data Sources & Ingestion

The platform supports multiple pluggable job ingestion providers inheriting from `JobDataProvider`:

1. **Adzuna API Provider**: Connects to Adzuna REST endpoints querying title, location, category, and salary metrics with deduplication based on `external_id` or `(company, title, location)`.
2. **File Ingestion Provider**: Allows uploading `.txt`, `.md`, `.json`, `.csv`, and `.pdf` files up to **5MB**. Automatically cleans boilerplate and parses distinct job descriptions using delimited sections.
3. **Manual Provider**: Direct single-job description submission via GUI form for rapid testing.

---

## 10. REST API Documentation

All API responses follow standardized JSON structures. In failure modes, errors strictly conform to:
```json
{
  "error": "ERROR_CODE",
  "message": "Human readable explanation",
  "details": []
}
```

### Core Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/health` | Service and database connectivity check |
| `GET` | `/api/careers` | List all supported career roles with `?category=` filter |
| `GET` | `/api/careers/categories` | Retrieve list of distinct career categories |
| `GET` | `/api/jobs` | Paginated job postings with keyword search |
| `POST` | `/api/jobs/search` | Trigger live job ingestion from provider (Adzuna/File/Manual) |
| `POST` | `/api/jobs/upload` | Upload multi-job document files (`.txt`, `.pdf`, etc.) |
| `GET` | `/api/jobs/<id>/match` | Calculate requirements match breakdown for user |
| `POST` | `/api/skills/extract` | Run batch LangChain skill extraction on role jobs |
| `GET` | `/api/skills/top` | Retrieve ranked skill demand frequencies for a role |
| `POST` | `/api/analysis` | Create and store a deterministic market analysis snapshot |
| `GET` | `/api/analysis/gaps` | Calculate user skill gaps directly against market frequencies |
| `GET` | `/api/profile` | Retrieve active user profile and rated skills |
| `PUT` | `/api/profile` | Update user name, email, or password |
| `POST` | `/api/profile/skills` | Add skill with proficiency (0=None to 4=Expert) |
| `PUT` | `/api/profile/skills` | Update existing skill proficiency |
| `POST` | `/api/roadmap/generate` | Generate personalized learning roadmap using Gemini |
| `GET` | `/api/roadmap/<id>` | Fetch complete roadmap with phases and projects |
| `POST` | `/api/projects/recommend` | On-demand generation of portfolio project suggestions |

---

## 11. Local Installation & Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 20+** and **npm**
- **MySQL 8.0 Server** (running locally, via Docker, or WSL2)
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/))
- **Adzuna API Credentials** (Optional for live job scraping: [Sign up here](https://developer.adzuna.com/))

### Step 1: Clone Repository
```bash
git clone https://github.com/ahamudul-hasan/Career_Intelligence.git
cd Career_Intelligence
```

### Step 2: Configure Environment
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

### Step 3: Backend Setup
```bash
# Create and activate Python virtual environment
python -m venv backend/venv

# Windows
backend\venv\Scripts\activate
# Linux/macOS
source backend/venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run database migrations and seed taxonomy
flask --app backend.app db upgrade
python -m backend.seeds.seed_careers
```

### Step 4: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will run at **`http://localhost:5173`** and the backend at **`http://127.0.0.1:5000`**.

### Running Tests
Execute the comprehensive PyTest test suite (64 tests):
```bash
python -m pytest backend/tests -v
```

---

## 12. Environment Configuration

| Variable | Description | Default / Example |
|:---|:---|:---|
| `FLASK_APP` | Entry point for Flask application | `backend.app` |
| `FLASK_ENV` | Application runtime environment | `development` / `production` |
| `SECRET_KEY` | Cryptographic secret for signing sessions | Secure random string |
| `DATABASE_URL` | SQLAlchemy MySQL connection string | `mysql+pymysql://career_user:career_password@127.0.0.1:3306/career_intelligence` |
| `GEMINI_API_KEY` | Google Gemini API key for structured AI calls | `AIzaSy...` |
| `GEMINI_MODEL` | Gemini model variant | `gemini-flash-latest` |
| `ADZUNA_APP_ID` | Adzuna Developer Application ID | Your App ID |
| `ADZUNA_APP_KEY` | Adzuna Developer Application Key | Your Secret Key |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:5173,http://127.0.0.1:5173` |

---

## 13. Visual Highlights & UI Walkthrough

### 1. Market Analysis & Section 56 Transparency Audit
Displays live skill frequencies calculated from genuine job descriptions. The header card prominently displays:
- **Target Career Role** & Seniority Level
- **Jobs Analyzed Sample Count**
- **Data Feeds / Sources Used**
- **Collection Timestamp**

### 2. Interactive Skill Gap Matrix
Categorizes skills into High, Medium, and Low priorities based on mathematical market frequency vs. user proficiency (0–4). Visual badges indicate whether the gap is critical for entry-level hiring.

### 3. Personalized Learning Roadmap & Recommended Projects
Structured sequential phases (e.g. 3–4 weeks each) detailing actionable milestones, estimated study hours, and resume-ready portfolio projects bridging the user's specific high-priority gaps.

---

## 14. End-to-End Example Workflow

Follow the complete verification flow demonstrated in Section 62:

```
Select Career (e.g. 'Backend Developer')
   └── Select Location ('US') & Experience ('entry_level')
          └── Ingest 25 Postings via Adzuna or Document File
                 └── HTML Stripped & Stored in MySQL
                        └── LangChain Extracts Skills
                               └── Synonyms Normalized (PostgreSQL, Docker, Redis)
                                      └── Python Aggregates Market Percentages (Snapshot #36)
                                             └── User Rates Existing Skills (Python: 1, SQL: 2)
                                                    └── Deterministic Skill Gaps Computed (Java: High, REST: High)
                                                           └── Personalized Roadmap Synthesized
                                                                  └── Resume Portfolio Project Attached!
```

---

## 15. Known Limitations & Edge Cases

- **Third-Party API Rate Limits**: Public job search APIs (e.g., Adzuna free tier) enforce rate limits. If quotas are exhausted, use the built-in `FileProvider` to ingest custom job descriptions without external dependencies.
- **Regional Demand Nuances**: Emerging local tools may have lower sample sizes in global datasets.
- **Experience Level Heuristics**: Certain postings omit explicit seniority tags; the platform categorizes these as `All` or `entry_level` based on title heuristics.

---

## 16. Future Roadmap

- **Resume PDF Extraction (Section 53)**: Upload PDF resume &rarr; text extraction &rarr; LLM structured skill profiling &rarr; auto-population of user proficiency levels.
- **GitHub Repository Analysis (Section 54)**: Connect GitHub OAuth &rarr; analyze languages and repository dependencies &rarr; generate verifiable evidence for user skills.
- **Historical Trend Visualizations (Section 55)**: Track skill demand fluctuations across quarterly snapshots.
- **Job Market RAG (Section 51)**: Vector embeddings for job postings allowing natural language queries ("Which remote backend roles demand Go over Java?").
- **LangGraph Agent Workflow (Section 52)**: Refactor the multi-step pipeline into a modular state graph with self-correcting evaluation nodes.

---

## 17. License & Credits

Developed with ❤️ as an open-source educational platform for computer science students and engineers worldwide.

Distributed under the **MIT License**.