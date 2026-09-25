-- Initial Career Roles Seed Data (Section 4)
-- Categories: Software Dev, AI/ML, Data, Infrastructure, Security, Quality

INSERT INTO career_roles (name, category, description) VALUES
('Backend Developer', 'Software Development', 'Designs and builds server-side logic, APIs, and database architectures.'),
('Frontend Developer', 'Software Development', 'Builds responsive user interfaces and client-side web applications.'),
('Full Stack Developer', 'Software Development', 'Works across both client-side and server-side components of web applications.'),
('Mobile Developer (iOS/Android)', 'Software Development', 'Designs and builds native and cross-platform mobile applications.'),
('AI / Machine Learning Engineer', 'AI/ML', 'Develops, trains, evaluates, and deploys machine learning models and AI pipelines.'),
('Data Scientist', 'Data', 'Extracts actionable insights from complex datasets using statistics and machine learning.'),
('Data Engineer', 'Data', 'Constructs scalable data pipelines, ETL workflows, and data warehousing architectures.'),
('DevOps / Cloud Engineer', 'Infrastructure', 'Automates cloud infrastructure, CI/CD pipelines, and manages system reliability.'),
('Cybersecurity Analyst', 'Security', 'Protects systems, networks, and data from cyber threats and vulnerabilities.'),
('QA / Test Automation Engineer', 'Quality', 'Designs and executes automated test suites to ensure software reliability and correctness.')
ON DUPLICATE KEY UPDATE description = VALUES(description);
