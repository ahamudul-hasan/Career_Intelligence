-- Canonical Skills and Aliases Seed (Section 20 reference)

INSERT INTO skills (name, normalized_name, category) VALUES
('Python', 'python', 'Programming Languages'),
('JavaScript', 'javascript', 'Programming Languages'),
('TypeScript', 'typescript', 'Programming Languages'),
('Go', 'go', 'Programming Languages'),
('Java', 'java', 'Programming Languages'),
('PostgreSQL', 'postgresql', 'Databases'),
('MySQL', 'mysql', 'Databases'),
('MongoDB', 'mongodb', 'Databases'),
('Redis', 'redis', 'Databases'),
('React', 'react', 'Frameworks & Libraries'),
('Node.js', 'nodejs', 'Frameworks & Libraries'),
('Flask', 'flask', 'Frameworks & Libraries'),
('FastAPI', 'fastapi', 'Frameworks & Libraries'),
('Docker', 'docker', 'DevOps & Cloud'),
('Kubernetes', 'kubernetes', 'DevOps & Cloud'),
('AWS', 'aws', 'DevOps & Cloud'),
('Git', 'git', 'Tools & Methodologies')
ON DUPLICATE KEY UPDATE normalized_name = VALUES(normalized_name);
