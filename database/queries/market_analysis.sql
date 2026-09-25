-- Reference & Debug Analytical Queries for Market Analysis (Section 49)
-- Computes skill frequency, appearance percentage, and breakdown across jobs

-- Parameterized: career_role_id = ?
-- 1. Skill Frequency and Demand Percentage for a specific career role:
SELECT 
    s.id AS skill_id,
    s.name AS skill_name,
    s.normalized_name,
    s.category,
    COUNT(DISTINCT js.job_id) AS skill_count,
    ROUND((COUNT(DISTINCT js.job_id) * 100.0 / total_jobs.cnt), 2) AS percentage,
    SUM(CASE WHEN js.importance = 'required' THEN 1 ELSE 0 END) AS required_count,
    SUM(CASE WHEN js.importance = 'preferred' THEN 1 ELSE 0 END) AS preferred_count
FROM job_skills js
JOIN skills s ON js.skill_id = s.id
JOIN jobs j ON js.job_id = j.id
CROSS JOIN (
    SELECT COUNT(DISTINCT id) AS cnt 
    FROM jobs 
    WHERE career_role_id = 1
) AS total_jobs
WHERE j.career_role_id = 1
GROUP BY s.id, s.name, s.normalized_name, s.category, total_jobs.cnt
HAVING total_jobs.cnt > 0
ORDER BY percentage DESC, skill_count DESC
LIMIT 50;
