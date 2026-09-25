# Database Documentation & Reference SQL

This directory holds hand-written reference SQL schemas, seeds, and analytical queries for the **CS Career Intelligence Platform**.

## Structure

```text
database/
├── schema/
│   └── schema.sql          # Full CREATE TABLE statements (Sections 22–33)
├── seeds/
│   ├── career_roles.sql    # Initial career taxonomy seed data (Section 4)
│   └── skills_aliases.sql  # Canonical skills/aliases seed data (Section 20)
├── queries/
│   └── market_analysis.sql # Reference & debug queries for skill frequency & percentage calcs (Section 49)
└── README.md                # This documentation file
```

## How `schema.sql` Relates to Alembic Migrations

- **Flask-Migrate / Alembic** (`backend/migrations/`) manages the live evolution of the database schema in Python/SQLAlchemy.
- `database/schema/schema.sql` is maintained alongside Alembic migrations as a clean, complete SQL reference for manual setup, client inspection, and testing.

## Local Seeding

To load initial seed data directly with MySQL:
```bash
mysql -u career_user -p career_intelligence < database/seeds/career_roles.sql
mysql -u career_user -p career_intelligence < database/seeds/skills_aliases.sql
```
Or use the automated backend migration & seeding scripts.
