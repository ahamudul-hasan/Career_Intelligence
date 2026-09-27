<div align="center">

# 🧭 Career Intelligence Platform

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
[![Gemini](https://img.shields.io/badge/Google_Gemini-3.8_Flash-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

<br />

[Explore Features](#-key-features) •
[Architecture](#-system-architecture) •
[Quickstart](#-quickstart-guide) •
[API Docs](#-api-reference) •
[Database Schema](#-database-architecture) •
[Implementation Status](#-implementation-status)

</div>

---

## 💡 Overview

Generic career guides like "Top 10 Things to Learn as a Backend Developer" are often outdated, conflicting, and detached from what employers actually require. 

**CS Career Intelligence Platform** eliminates guesswork by turning current job postings into an empirical, data-driven learning engine:

1. **Extracts Live Market Requirements**: Analyzes 20–30 real job postings per role via verified APIs (Adzuna).
2. **Computes Deterministic Statistics**: Calculates actual market appearance percentages in Python/SQL — **the LLM never invents statistics**.
3. **Audits Your Existing Profile**: Evaluates your proficiency (0 = None to 4 = Expert) against employer demand.
4. **Synthesizes a Custom Roadmap**: Uses Google Gemini + LangChain to generate structured learning phases and portfolio projects tailored specifically to your unique skill gaps.

> [!IMPORTANT]
> **Core Engineering Guardrail**: Percentages, frequencies, and gap classifications are **100% deterministic** (calculated in Python & MySQL). The LLM is used exclusively for unstructured text parsing, taxonomy extraction, and synthesizing actionable learning guidance.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Frontend)"]
        UI["React 19 + TypeScript + Tailwind CSS v4"]
        RC["Recharts Analytics & Interactive Diagnostic Dashboard"]
        ROUTER["React Router (Multi-Page Navigation)"]
    end

    subgraph Server ["Application Layer (Flask REST API)"]
        API["Flask 3.0 Application & Blueprints"]
        AUTH["Pydantic Validation Layer (Schemas)"]
        SRV["Business Logic Services (Analysis & Gaps)"]
    end

    subgraph Data ["Data & Providers Layer"]
        ADZUNA["Adzuna API Provider"]
        CLEANER["Text Cleaner & Normalization Pipeline"]
        MYSQL[("MySQL 8.0 (WSL2 / InnoDB)")]
    end

    subgraph AI ["AI Orchestration Layer"]
        LC["LangChain Engine"]
        GEMINI["Google Gemini 2.5 Flash"]
    end

    UI <-->|HTTP / JSON via Vite Proxy| API
    API --> AUTH --> SRV
    SRV <-->|SQLAlchemy ORM + PyMySQL| MYSQL
    SRV --> ADZUNA --> CLEANER --> MYSQL
    SRV <--> LC <--> GEMINI
```

---

## ✨ Key Features

| Category | Capability | Technical Implementation |
|:---|:---|:---|
| 🎯 **Career Taxonomy** | 25 canonical roles across 6 core tech domains with live search and category filtering | MySQL `career_roles` table, seed scripts, REST endpoints |
| 🔍 **Job Postings Ingestion** | Live retrieval from authorized job search APIs and manual import options | Pluggable `JobDataProvider` abstraction (Adzuna, Manual, Files) |
| 🧹 **Automated Text Cleaning** | Strips messy HTML boilerplate, collapses excess whitespace, and normalizes Unicode | Regex cleaner, Unicode NFKD normalization |
| 🤖 **AI Skill Extraction** | Parses technical and soft requirements with importance level and confidence scores | LangChain `with_structured_output` + Google Gemini |
| 🧬 **Skill Normalization** | Merges synonyms (e.g. `PostgreSQL`, `Postgres`, `psql` ➔ `PostgreSQL`) | Hash dictionary alias lookup + fallback normalizer |
| 📊 **Deterministic Analytics** | Pure SQL aggregation computing true market demand percentages | Parameterized analytical queries, Recharts bar charts |
| 🧑‍💻 **Developer Skill Profile** | Self-reported proficiency scoring (0 = None, 1 = Beginner, 2 = Mid, 3 = Adv, 4 = Expert) | `user_skills` table with fast lookup maps |
| ⚡ **Skill Gap Engine** | Identifies High, Medium, and Low priority gaps using configurable thresholds | Configurable rules in `config/settings.py` |
| 🗺️ **Personalized Roadmaps** | Step-by-step phase roadmap prioritizing critical missing requirements | Structured LangChain prompt with real calculated data |
| 🛠️ **Project Recommendations** | Recommends resume-ready portfolio projects targeting major gaps | Generative project recommender linked to roadmap items |

---

## 🎯 Supported Career Taxonomy

The platform features an extensible, database-driven career taxonomy of **25 roles across 6 domains**:

```
├── 💻 Software Development
│   ├── Software Engineer
│   ├── Backend Developer
│   ├── Frontend Developer
│   ├── Full Stack Developer
│   └── Mobile Developer (iOS / Android)
├── 🤖 AI / Machine Learning
│   ├── AI Engineer
│   ├── ML Engineer
│   ├── LLM Engineer
│   ├── Generative AI Engineer
│   └── MLOps Engineer
├── 📊 Data Engineering & Analytics
│   ├── Data Scientist
│   ├── Data Analyst
│   ├── Data Engineer
│   └── Analytics Engineer (dbt)
├── ☁️ Cloud & Infrastructure
│   ├── DevOps Engineer
│   ├── Cloud Engineer (AWS / GCP / Azure)
│   ├── Site Reliability Engineer (SRE)
│   ├── Platform Engineer
│   └── GPU / CUDA Engineer
├── 🛡️ Cybersecurity
│   ├── Cybersecurity Engineer
│   ├── Application Security Engineer
│   └── SOC Analyst
└── 🧪 Quality & Reliability
    ├── QA Engineer
    ├── SDET (Software Dev Engineer in Test)
    └── Automation Test Engineer
```

---

## 🧰 Technology Stack

### Backend
* **Runtime & Framework**: Python 3.10+, Flask 3.0+
* **ORM & Database Drivers**: SQLAlchemy 2.0, PyMySQL, Cryptography
* **Schema Migration & Versioning**: Flask-Migrate, Alembic
* **Data Validation**: Pydantic v2 (Strict typing & validation)
* **Cross-Origin Handling**: Flask-CORS
* **Testing**: PyTest with automated test clients

### Frontend
* **Core & Build System**: React 19, TypeScript, Vite 8
* **Styling**: Tailwind CSS v4, Lucide React (Modern iconography)
* **Routing**: React Router DOM v7
* **Data Visualization**: Recharts (Responsive bar charts & analytics)
* **Networking**: Axios with centralized error interceptors
* **Code Quality**: Oxlint (High-performance linter)

### AI & Data
* **LLM Engine**: Google Gemini 2.5 Flash via `langchain-google-genai`
* **Primary Database**: MySQL 8.0 Community Server (WSL2 / Local)
* **Job Ingestion API**: Adzuna Developer API

---

## 🗄️ Database Architecture

The authoritative schema is maintained via **Alembic migrations** (`backend/migrations/`) while raw SQL references reside in `database/`:

```
┌────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  career_roles  │◄──────┤      jobs       │◄──────┤   job_skills    │
└───────┬────────┘       └────────┬────────┘       └────────┬────────┘
        │                         │                         │
        ▼                         ▼                         ▼
┌────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    analyses    │       │     skills      │◄──────┤   user_skills   │
└───────┬────────┘       └────────┬────────┘       └────────▲────────┘
        │                         │                         │
        ▼                         ▼                         │
┌────────────────┐       ┌─────────────────┐       ┌────────┴────────┐
│    roadmaps    │◄──────┤ roadmap_phases  │       │      users      │
└───────┬────────┘       └────────┬────────┘       └─────────────────┘
        ▼                         ▼
┌────────────────┐       ┌─────────────────┐
│ roadmap_items  │◄──────┤roadmap_projects │
└────────────────┘       └─────────────────┘
```

<details>
<summary><strong>View Detailed Tables Overview</strong></summary>

| Table | Description |
|:---|:---|
| `career_roles` | Canonical list of 25 supported tech careers across 6 categories |
| `jobs` | Ingested job postings with cleaned descriptions and external IDs |
| `skills` | Canonical dictionary of normalized tech skills and categories |
| `job_skills` | Many-to-many relationship linking jobs to skills (importance, confidence) |
| `user_skills` | User self-reported skill proficiency ratings (0 to 4) |
| `analyses` | Market analysis runs for a career, target location, and experience level |
| `roadmaps` | Generated learning roadmaps tied to users and careers |
| `roadmap_phases` | Logical phases within a roadmap (e.g. Phase 1: Core Fundamentals) |
| `roadmap_items` | Specific skills or concepts to learn within each phase |
| `projects` | Portfolio project ideas mapped to skill gaps |
| `roadmap_projects`| Junction table associating projects with roadmap phases |

</details>

---

## 📡 API Reference

All endpoints return JSON and use standard HTTP response codes.

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/health` | System health check (service name, version, status) |
| `GET` | `/api/careers` | List career roles (supports `?category=` and `?search=`) |
| `GET` | `/api/careers/categories` | List distinct career categories |
| `GET` | `/api/careers/<id>` | Retrieve specific career role details |
| `GET` | `/api/jobs` | Query stored jobs (supports `?career_role_id=` and `?limit=`) |
| `POST` | `/api/jobs/import` | Manually import a job description for analysis |
| `GET` | `/api/jobs/<id>` | Retrieve single job posting details |
| `GET` | `/api/skills` | List canonical normalized skills |
| `GET` | `/api/skills/top` | Top skills ranked by empirical market frequency (`?career_role_id=`) |
| `GET` | `/api/analysis/<id>` | Retrieve analysis metadata |
| `GET` | `/api/analysis/<id>/skills` | Get calculated market skill breakdown |
| `GET` | `/api/analysis/<id>/gaps` | Compute deterministic skill gaps (`?user_id=`) |
| `GET` | `/api/profile` | Retrieve user profile (defaults to user ID 1) |
| `GET` | `/api/profile/skills` | List user's rated skills |
| `GET` | `/api/projects` | List recommended portfolio projects |

---