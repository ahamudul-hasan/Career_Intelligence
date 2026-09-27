-- Initial Career Roles Seed Data (Section 4)
-- Categories: Software Development, AI / ML, Data, Infrastructure, Security, Quality

INSERT INTO career_roles (name, category, description) VALUES
-- Software Development
('Software Engineer', 'Software Development', 'Designs, develops, tests, and maintains full lifecycle software applications and systems.'),
('Backend Developer', 'Software Development', 'Designs and builds robust server-side logic, RESTful APIs, microservices, and database systems.'),
('Frontend Developer', 'Software Development', 'Constructs interactive, performant user interfaces, responsive layouts, and client-side web apps.'),
('Full Stack Developer', 'Software Development', 'Builds end-to-end web applications across client interfaces, servers, APIs, and data stores.'),
('Mobile Developer', 'Software Development', 'Develops native (iOS/Android) and cross-platform mobile applications for smartphones and tablets.'),

-- AI / ML
('AI Engineer', 'AI / ML', 'Integrates, fine-tunes, and deploys AI models, agentic workflows, and LLM-powered applications.'),
('ML Engineer', 'AI / ML', 'Researches, trains, evaluates, and deploys machine learning models to production environments.'),
('LLM Engineer', 'AI / ML', 'Specializes in large language model prompt engineering, fine-tuning, RAG pipelines, and model evaluation.'),
('Generative AI Engineer', 'AI / ML', 'Develops systems leveraging diffusion models, multi-modal LLMs, and synthetic content generation.'),
('MLOps Engineer', 'AI / ML', 'Builds CI/CD pipelines for machine learning, model monitoring, automated retraining, and artifact versioning.'),

-- Data
('Data Scientist', 'Data', 'Extracts actionable business insights and predictive value from complex datasets using statistical modeling and ML.'),
('Data Analyst', 'Data', 'Analyzes structured datasets, designs dashboards, and delivers exploratory data analysis to stakeholders.'),
('Data Engineer', 'Data', 'Constructs scalable data pipelines, ETL/ELT workflows, real-time streaming, and data warehousing architectures.'),
('Analytics Engineer', 'Data', 'Bridges the gap between data engineering and business analysis by maintaining clean, modeled data transforms (dbt).'),

-- Infrastructure
('DevOps Engineer', 'Infrastructure', 'Automates cloud infrastructure, manages CI/CD pipelines, container orchestration, and developer productivity.'),
('Cloud Engineer', 'Infrastructure', 'Architects, secures, and maintains cloud computing environments across AWS, Azure, and GCP.'),
('Site Reliability Engineer (SRE)', 'Infrastructure', 'Applies software engineering principles to operations, ensuring high availability, latency limits, and uptime.'),
('Platform Engineer', 'Infrastructure', 'Builds internal developer platforms (IDPs) and self-service tooling to accelerate engineering workflows.'),
('GPU / CUDA Engineer', 'Infrastructure', 'Optimizes low-level high-performance computing, kernel operations, and hardware acceleration for AI workloads.'),

-- Security
('Cybersecurity Engineer', 'Security', 'Designs and enforces multi-layered defense architectures, incident response protocols, and security monitoring.'),
('Application Security Engineer', 'Security', 'Performs threat modeling, code audits, penetration testing, and ensures secure software development lifecycles.'),
('SOC Analyst', 'Security', 'Monitors security information and event management (SIEM) systems to detect, triage, and remediate threat alerts.'),

-- Quality
('QA Engineer', 'Quality', 'Designs and executes manual and automated test strategies to guarantee product quality and specification adherence.'),
('SDET (Software Dev Engineer in Test)', 'Quality', 'Develops automated testing frameworks, integration harnesses, and load test scripts like an engineer.'),
('Automation Test Engineer', 'Quality', 'Specializes in UI/API test automation pipelines, end-to-end regression suites, and continuous testing.')
ON DUPLICATE KEY UPDATE 
    category = VALUES(category),
    description = VALUES(description);
